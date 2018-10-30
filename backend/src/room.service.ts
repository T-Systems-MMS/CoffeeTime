import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { RoomType } from './domain/roomtype.enum';
import { RoomState } from './domain/roomstate.enum';
import { RoomModelName, RoomData } from './domain/schema/roomdata.schema';
import { HistoryModelName, HistoryData } from './domain/schema/history.schema';
import { ForecastData, ForecastModelName } from './domain/schema/forecast.schema';
import { Filling } from './domain/filling';
import { PushService } from './push.service';
import { PushSubscriptionModelName, PushSubscriptionData } from './domain/schema/pushsubscriptiondata.schema';
import { PushModelName, PushData } from './domain/schema/pushdata.schema';

enum RoomFilling {
    SEMIFULL = 0.20,
    FULL = 0.75,
}

// timings
const INTERVAL = 60; // aggregation in seconds, should be less or equal to 60
const MILLISECOND_FACTOR = 1000;
const HOUR_MILLIS = 60 * 60 * 1000;
const MILLI_INTERVAL = INTERVAL * MILLISECOND_FACTOR;
const DAY_MILLIS = 24 * 60 * 60 * 1000;
// forecast values to store
const MAX_FORECAST_VALUES = 4;
// occupancies weight (only for values > 0)
const WEIGHT_FACTOR = 2;
// IF FREE SETTINGS
// min 3 minutes should be the room free
const MIN_FREE_INTERVALS = 3 * 60 / INTERVAL; // free window
// 10 minutes lookup window in the past
const FREE_INTERVALS_WINDOW = 10 * 60 / INTERVAL; // whole window
// RECOMMENDATION SETTINGS
// 10 minutes should be the room free (+ 2 minutes for local regression)
const FREE_TIME = 12 * 60; // seconds
// 5 minutes should be the room full (+ 2 minutes for local regression)
const RECOMMENDATION_FORCAST = FREE_TIME + 7 * 60; // seconds
/**
 * Kernel is used to smooth forecast occupancies to detect room filling in a robust way.
 * (Local Regression)
 *
 * Is calculated with 1000 samples with sigma = 1.0.
 * -> calc with gauss blur: https://en.wikipedia.org/wiki/Gaussian_blur
 *    (calc y value for [-2..2] -> 1000 x values)
 * -> integrate with simphson rule: https://en.wikipedia.org/wiki/Simpson%27s_rule
 *    ("sum up" all y values of gaussian normal distribution for each step to have weight for each step)
 */
const GAUSSIAN_KERNEL = [0.06136, 0.24477, 0.38774, 0.24477, 0.06136];

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(RoomModelName)
        private readonly roomModel: Model<RoomData>,
        @InjectModel(HistoryModelName)
        private readonly historyModel: Model<HistoryData>,
        @InjectModel(ForecastModelName)
        private readonly forecastModel: Model<ForecastData>,
        @InjectModel(PushSubscriptionModelName)
        private readonly pushSubscriptionModel: Model<PushSubscriptionData>,
        @InjectModel(PushModelName)
        private readonly pushModel: Model<PushData>,
        private pushService: PushService,
    ) { }

    async rooms(subscriptionAuth = ''): Promise<RoomData[]> {
        const startOfDay = moment.utc().startOf('day').valueOf();
        const from = moment.utc().subtract(2, 'hours').valueOf();
        const now = moment.utc().valueOf() - startOfDay;
        const to = now + HOUR_MILLIS;

        const startTime = Date.now();
        const rooms = await this.roomModel
            .aggregate([
                {
                    $lookup: {
                        from: this.forecastModel.collection.name,
                        let: { forecast_ids: '$forecast' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $and: [{ $gt: ['$offset', now] }, { $lt: ['$offset', to] }, { $in: ['$_id', '$$forecast_ids'] }] },
                                },
                            },
                            { $addFields: { timestamp: { $add: ['$offset', startOfDay] } } },
                            { $sort: { offset: 1 } },
                        ],
                        as: 'forecast',
                    },
                },
                { $lookup: { from: 'historydatas', localField: 'history', foreignField: '_id', as: 'history' } },
                {
                    $lookup: {
                        from: 'pushdatas',
                        let: { room_id: '$id' },
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'pushsubscriptiondatas',
                                    let: { subscription_ids: '$subscriptions' },
                                    pipeline: [{
                                        $match: {
                                            $expr: {
                                                $and: [{ $eq: ['$roomId', '$$room_id'] }, { $in: ['$_id', '$$subscription_ids'] }],
                                            },
                                        },
                                    }],
                                    as: 'subscriptions',
                                },
                            },
                            { $match: { $expr: { $eq: ['$auth', subscriptionAuth] } } },
                            { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$subscriptions', 0] }, '$$ROOT'] } } },
                            { $project: { _id: 0, __v: 0, roomId: 0, subscriptions: 0, endpoint: 0, auth: 0, p256dh: 0 } },
                        ],
                        as: 'pushdata',
                    },
                },
                { $addFields: { push: { $arrayElemAt: ['$pushdata', 0] } } },
                {
                    $project: {
                        id: 1, name: 1, type: 1, status: 1, averageWaitingTime: 1, averageOccupancy: 1, push: 1, forecast: 1,
                        history: { $filter: { input: '$history', as: 'h', cond: { $gt: ['$$h.timestamp', from] } } },
                    },
                },
                {
                    $project: {
                        '_id': 0, 'forecast._id': 0, 'forecast.__v': 0, 'forecast.offset': 0,
                        'forecast.occupancyValues': 0, 'history._id': 0, 'history.__v': 0,
                    },
                },
            ])
            .exec();
        rooms.forEach(room => {
            room.history.sort((p, n) => p.timestamp - n.timestamp);
        });
        Logger.log(`rooms fetch take: ${Date.now() - startTime}ms`, RoomService.name);
        return rooms;
    }

    async roomsForRecommendation(): Promise<RoomData[]> {
        const { offset } = this.calcOffsetAndTimeStamp();
        const toOffset = offset + RECOMMENDATION_FORCAST * MILLISECOND_FACTOR;
        const resultList = [];
        const rooms = await this.roomModel
            .aggregate([
                {
                    $lookup: {
                        from: this.forecastModel.collection.name,
                        let: { forecast_ids: '$forecast' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $in: ['$_id', '$$forecast_ids'] }, { $gte: ['$offset', offset] }, { $lt: ['$offset', toOffset] }],
                                    },
                                },
                            },
                            { $sort: { offset: 1 } },
                        ],
                        as: 'forecast',
                    },
                },
                { $match: { forecast: { $gt: [] } } },
                { $project: { history: 0 } },
            ])
            .exec();

        const freeOffset = offset + FREE_TIME * MILLISECOND_FACTOR;
        const window = Math.floor(GAUSSIAN_KERNEL.length / 2);
        // 1 forecast occupancy per phase could be missing
        const minFreeCount = Math.ceil(FREE_TIME / INTERVAL) - window - 1;
        const minFullCount = Math.ceil((RECOMMENDATION_FORCAST - FREE_TIME) / INTERVAL) - window - 1;
        let freeCount = 0;
        let fullCount = 0;
        let occupancies = [];

        rooms.forEach(room => {
            let matched = false;
            const forecastLength = room.forecast.length;
            Logger.log(`${room.id} - got ${forecastLength} forecast values`, RoomService.name + ':roomsForRecommendation');
            // forecast should be long enough
            if (forecastLength > GAUSSIAN_KERNEL.length) {
                matched = room.forecast.reduce((memo, forecast, index) => {
                    // ignore values where the full kernel can't be applied
                    if (index < window || index > forecastLength - window - 1) {
                        return memo && true;
                    }
                    // apply kernel on every value
                    const smoothedValue = room.forecast
                        .slice(index - window, index + window + 1)
                        .reduce((sum, value, kernelIndex) => sum += value.occupancy * GAUSSIAN_KERNEL[kernelIndex], 0);
                    occupancies.push(Math.round(smoothedValue * 100) / 100);
                    // check smoothed value apply our rules
                    if (forecast.offset < freeOffset) {
                        freeCount++;
                        return memo && smoothedValue < RoomFilling.SEMIFULL;
                    } else {
                        fullCount++;
                        return memo && smoothedValue > RoomFilling.SEMIFULL;
                    }
                }, true);
            }
            // if rule (10 min free, 5 min full) matched, a minimum of forecasts for free phase and a minimum for full phase is given
            // the room can be pushed
            if (matched && freeCount >= minFreeCount && fullCount >= minFullCount) {
                resultList.push(room);
            }
            const freeValuesString = occupancies.slice(0, freeCount).join(', ');
            const fullValuesString = occupancies.slice(freeCount, freeCount + fullCount).join(', ');
            // tslint:disable-next-line:max-line-length
            Logger.log(`${room.id} - forecast checked: [${freeValuesString}] to [${fullValuesString}] with ${RoomFilling.SEMIFULL}, ${minFreeCount}, ${minFullCount}`,
                RoomService.name + ':roomsForRecommendation');
            // reset for the next room
            occupancies = [];
            freeCount = 0;
            fullCount = 0;
        });

        Logger.log(`Got ${resultList.length} rooms to recommend`, RoomService.name + ':roomsForRecommendation');

        return resultList;
    }

    room(roomId: string): Promise<RoomData> {
        return this.roomModel
            .findOne({ id: roomId }, { _id: 0, __v: 0, forecast: 0 })
            .populate({
                path: 'history',
                select: '-_id',
                match: { timestamp: { $gt: moment.utc().subtract(3, 'days').valueOf() } },
            })
            .exec();
    }

    async updateRoom(location: string, fillings: Filling[]): Promise<RoomData> {
        try {
            let room = await this.roomModel.findOne({ id: location })
                .populate('history')
                .populate('forecast');
            if (!room) {
                room = new this.roomModel();
                // set general values
                room.id = location;
                room.name = location.charAt(0).toUpperCase() + location.slice(1);
                room.type = location.startsWith('sitz') ? RoomType.AREA : RoomType.KITCHEN;
            }
            // sort to have correct order
            fillings = fillings.sort((p, n) => p.timestamp - n.timestamp);

            // process history and forecast
            room = await this.processRoom(room, fillings);

            // save room
            return room.save();
        } catch (e) {
            Logger.error(e, RoomService.name + ':updateRoom');
        }
    }

    private async processRoom(room: RoomData, fillings: Filling[]): Promise<RoomData> {
        try {
            // prepare forecast processing
            const forecastMap = room.forecast.reduce((memo, forecast) => {
                memo.set(forecast.offset + 'ms', forecast);
                return memo;
            }, new Map<string, any>());
            let { timestamp, offset } = this.calcOffsetAndTimeStamp(fillings[0].timestamp);
            // upper timestamp to check time slot end
            let nextTimestamp = timestamp + MILLI_INTERVAL;
            let sum = 0;
            let count = 0;
            // last processed timestamp
            const lastTimestamp = room.history.length > 0 ? room.history[room.history.length - 1].timestamp : 0;

            for (const filling of fillings) {
                // time slot over? -> ATTENTION: the last slot is ignored, because it is processed next time with all values present
                if (filling.timestamp >= nextTimestamp) {
                    // at least one value is needed and timestamp should not already processed
                    if (timestamp > lastTimestamp && count > 0) {
                        // average value
                        const occupancy = sum / count;

                        Logger.log(`${room.id} - new history item [${timestamp}, ${occupancy}]`, RoomService.name + ':processRoom');

                        // add new history item
                        const newHistory = new this.historyModel({ _id: new Types.ObjectId(), occupancy, timestamp });
                        await newHistory.save();
                        room.history.push(newHistory);

                        // caculate forecast occupancy
                        const weekDay = moment.utc(timestamp).isoWeekday();
                        // ignore saturday and sunday
                        if (weekDay < 6) {
                            const occupancies = await this.calculateForecastOccupancy(forecastMap, occupancy, offset);
                            Logger.log(`${room.id} - forecast changed [${offset}, ${occupancies.map(o => Math.round(o * 100) / 100).join(' -> ')}]`,
                                RoomService.name + ':processRoom');
                        }
                    }

                    // go to next time slot
                    timestamp = nextTimestamp;
                    offset += MILLI_INTERVAL;
                    // we have to stay in 24h raster
                    offset = offset % DAY_MILLIS;
                    nextTimestamp = timestamp + MILLI_INTERVAL;
                    sum = 0;
                    count = 0;
                }

                // sum up values
                if (filling.filling > 0) {
                    sum += filling.filling * WEIGHT_FACTOR;
                    count += WEIGHT_FACTOR;
                } else {
                    sum += filling.filling;
                    count++;
                }
            }

            // set forecast
            const processedForecast = Array.from(forecastMap.values());
            processedForecast.sort((p, n) => p.offset - n.offset);
            room.forecast = processedForecast.map(value => value._id);

            // update status
            room.status = this.getStatus(room.history);

            // trigger isFree push
            try {
                await this.triggerIsFreePush(room);
            } catch (e) {
                Logger.error(e, RoomService.name + ':processRoom');
            }

            // update history and set average values
            const { history, averageWaitingTime, averageOccupancy } = this.filterHistoryAndCalcAverage(room.history);
            room.history = history;
            room.averageWaitingTime = averageWaitingTime;
            room.averageOccupancy = averageOccupancy;

            return room;
        } catch (e) {
            Logger.error(e, RoomService.name + ':processRoom');
        }
    }

    private calcOffsetAndTimeStamp(givenTimeStamp = moment.utc().valueOf()): { timestamp: number, offset: number } {
        // update history and forecast
        const date = moment.utc(givenTimeStamp);
        // get raster seconds
        const seconds = Math.floor(date.seconds() / INTERVAL);
        // calculate start timestamp for processing
        const timestamp = date.startOf('minute').valueOf() + seconds * MILLI_INTERVAL;
        // start offset for forecast
        const offset = moment.utc(timestamp).valueOf() - date.startOf('day').valueOf();
        return {
            timestamp,
            offset,
        };
    }

    private async calculateForecastOccupancy(forecastMap: Map<string, any>, occupancy: number, offset: number): Promise<number[]> {
        // check if forecast for offset exists, otherwise we have to create a new one
        if (!forecastMap.has(offset + 'ms')) {
            const newForcast = new this.forecastModel({ _id: new Types.ObjectId(), occupancy, occupancyValues: [], offset });
            forecastMap.set(offset + 'ms', newForcast);
        }
        // hold only a few values
        const forecast = forecastMap.get(offset + 'ms');
        if (forecast.occupancyValues.length >= MAX_FORECAST_VALUES) {
            forecast.occupancyValues.shift();
        }
        // add new value
        const newLength = forecast.occupancyValues.push(occupancy);
        // calc new forecast value
        const oldOccupancy = forecast.occupancy;
        const newOccupancy = forecast.occupancyValues.reduce((valueSum, value) => valueSum + value, 0) / newLength;

        // set new one
        forecast.occupancy = newOccupancy;
        await forecast.save();

        return [oldOccupancy, newOccupancy];
    }

    private getStatus(history: HistoryData[]) {
        // update status
        if (history.length > 0) {
            const filling = history[history.length - 1].occupancy;
            return filling > RoomFilling.FULL
                ? RoomState.FULL
                : (filling > RoomFilling.SEMIFULL ? RoomState.SEMIFULL : RoomState.FREE);
        }
        return RoomState.FREE;
    }

    private filterHistoryAndCalcAverage(history: HistoryData[]): { history: any[], averageWaitingTime: number, averageOccupancy: number } {
        const lowerBound = moment().utc().subtract(7, 'days').valueOf();
        let occupanySum = 0;
        let timeSum = 0;
        let lastOccupancy = 0;
        let lastTimeStamp;
        let timeBlockCount = 0;
        const result = { history: [], averageWaitingTime: null, averageOccupancy: null };
        result.history = history.filter(value => value.timestamp > lowerBound).map(value => {
            occupanySum += value.occupancy;
            if (lastTimeStamp && value.occupancy > RoomFilling.SEMIFULL) {
                timeSum += Math.abs(value.timestamp - lastTimeStamp) / (value.occupancy > RoomFilling.FULL ? 1 : 2);
            }
            if (value.occupancy < RoomFilling.SEMIFULL && lastOccupancy > RoomFilling.SEMIFULL) {
                timeBlockCount++;
            }
            lastOccupancy = value.occupancy;
            lastTimeStamp = value.timestamp;
            return value._id;
        });

        if (history.length > 0) {
            result.averageOccupancy = occupanySum / history.length;
        }
        if (timeBlockCount > 0) {
            result.averageWaitingTime = Math.round(timeSum / timeBlockCount);
        }
        return result;
    }

    private async triggerIsFreePush(room: RoomData): Promise<any> {
        const end = room.history.length;
        const start = end >= FREE_INTERVALS_WINDOW + 1 ? end - FREE_INTERVALS_WINDOW - 1 : 0;
        let freeCount = 0;

        // get slice
        const slice = room.history.slice(start, end).reverse();

        // count free slots
        for (const item of slice) {
            if (item.occupancy < RoomFilling.SEMIFULL) {
                freeCount++;
            } else {
                // at least at the last index should this be called
                break;
            }
        }

        // send push only if we have also a non free slot
        if (freeCount >= MIN_FREE_INTERVALS && freeCount <= FREE_INTERVALS_WINDOW) {
            Logger.log(`${room.id} - free intervals ${freeCount} -> send push`, RoomService.name + ':triggerIsFreePush');
            await this.pushService.sendIfFreePush(room);
        }
    }
}
