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

const INTERVAL = 1; // aggregation in minutes
const MIN_MILLISECOND_FACTOR = 60000;
const HOUR_MILLIS = 60 * 60 * 1000;
const MILLI_INTERVAL = INTERVAL * MIN_MILLISECOND_FACTOR;
const MAX_FORECAST_VALUES = 4;
const DAY_MILLIS = 24 * 60 * 60 * 1000;
const WEIGHT_FACTOR = 2;
const FREE_TIME = 10; // minutes
const RECOMMENDATION_FORCAST = FREE_TIME + 5; // minutes
const MIN_FREE_INTERVALS = 3;
const FREE_INTERVALS_WINDOW = 10;

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

    rooms(subscriptionAuth = ''): Promise<RoomData[]> {
        const startOfDay = moment.utc().startOf('day').valueOf();
        const from = moment.utc().subtract(2, 'hours').valueOf();
        const now = moment.utc().valueOf() - startOfDay;
        const to = now + HOUR_MILLIS;

        return this.roomModel
            .aggregate([
                {
                    $lookup: {
                        from: this.forecastModel.collection.name,
                        let: { forecast_ids: '$forecast' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $and: [{ $in: ['$_id', '$$forecast_ids'] }, { $gt: ['$offset', now] }, { $lt: ['$offset', to] }] },
                                },
                            },
                            { $addFields: { timestamp: { $add: ['$offset', startOfDay] } } },
                            { $sort: { offset: 1 } },
                        ],
                        as: 'forecast',
                    },
                },
                {
                    $lookup: {
                        from: this.historyModel.collection.name,
                        let: { history_ids: '$history' },
                        pipeline: [
                            {
                                $match: { $expr: { $and: [{ $in: ['$_id', '$$history_ids'] }, { $gt: ['$timestamp', from] }] } },
                            },
                            { $sort: { timestamp: 1 } },
                        ],
                        as: 'history',
                    },
                },
                {
                    $lookup: {
                        from: this.pushModel.collection.name,
                        let: { room_id: '$id' },
                        pipeline: [
                            {
                                $lookup: {
                                    from: this.pushSubscriptionModel.collection.name,
                                    pipeline: [{ $match: { $expr: { $eq: ['$roomId', '$$room_id'] } } }],
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
                { $sort: { id: 1 } },
                {
                    $project: {
                        '_id': 0,
                        '__v': 0,
                        'pushdata': 0,
                        'push._id': 0,
                        'push.__v': 0,
                        'push.roomId': 0,
                        'forecast._id': 0,
                        'forecast.__v': 0,
                        'forecast.offset': 0,
                        'forecast.occupancyValues': 0,
                        'history._id': 0,
                        'history.__v': 0,
                    },
                },
            ])
            .exec();
    }

    async roomsForRecommendation(): Promise<RoomData[]> {
        const { offset } = this.calcOffsetAndTimeStamp();
        const toOffset = offset + RECOMMENDATION_FORCAST * MIN_MILLISECOND_FACTOR;
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

        const freeOffset = offset + FREE_TIME * MIN_MILLISECOND_FACTOR;
        const minFreeCount = Math.ceil(FREE_TIME / INTERVAL) - 1;
        const minFullCount = Math.ceil((RECOMMENDATION_FORCAST - FREE_TIME) / INTERVAL) - 1;
        let freeCount = 0;
        let fullCount = 0;
        let occupancies = [];

        rooms.forEach(room => {
            const matched = room.forecast.reduce((memo, forecast) => {
                occupancies.push(Math.round(forecast.occupancy * 100) / 100);
                if (forecast.offset < freeOffset) {
                    freeCount++;
                    return memo && forecast.occupancy < RoomFilling.SEMIFULL;
                } else {
                    fullCount++;
                    return memo && forecast.occupancy > RoomFilling.SEMIFULL;
                }
            }, true);
            if (matched && freeCount >= minFreeCount && fullCount >= minFullCount) {
                resultList.push(room);
            }
            // tslint:disable-next-line:max-line-length
            Logger.log(`Forecast occupancies checked: [${occupancies.join(' ')}] by ${freeCount}:${fullCount}`, RoomService.name);
            // reset for the next room
            occupancies = [];
            freeCount = 0;
            fullCount = 0;
        });

        Logger.log(`Got ${resultList.length} rooms to recommend`, RoomService.name);

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
            Logger.error(e);
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
            // tslint:disable-next-line:max-line-length
            Logger.log(`${room.id} offset: ${offset} time: ${moment.utc(timestamp).format()} next: ${moment.utc(nextTimestamp).format()}`, RoomService.name);

            for (const filling of fillings) {
                // time slot over? -> ATTENTION: the last slot is ignored, because it is processed next time with all values present
                if (filling.timestamp >= nextTimestamp) {
                    // at least one value is needed and timestamp should not already processed
                    if (timestamp > lastTimestamp && count > 0) {
                        // average value
                        const occupancy = sum / count;

                        Logger.log(`history ${room.id} time: ${moment.utc(timestamp).format()} occupancy: ${occupancy}`, RoomService.name);

                        // add new history item
                        const newHistory = new this.historyModel({ _id: new Types.ObjectId(), occupancy, timestamp });
                        await newHistory.save();
                        room.history.push(newHistory);

                        // caculate forecast occupancy
                        const weekDay = moment.utc(timestamp).isoWeekday();
                        // ignore saturday and sunday
                        if (weekDay < 6) {
                            const occupancies = await this.calculateForecastOccupancy(forecastMap, occupancy, offset);
                            Logger.log(`forecast ${room.id} offset: ${offset} occupancy: ${occupancies[0]} -> ${occupancies[1]}`, RoomService.name);
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
                if (filling.filling > RoomFilling.SEMIFULL) {
                    sum += filling.filling * WEIGHT_FACTOR;
                    count += 2;
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
                Logger.error(e);
            }

            // update history and set average values
            const { history, averageWaitingTime, averageOccupancy } = this.filterHistoryAndCalcAverage(room.history);
            room.history = history;
            room.averageWaitingTime = averageWaitingTime;
            room.averageOccupancy = averageOccupancy;

            return room;
        } catch (e) {
            Logger.error(e);
        }
    }

    private calcOffsetAndTimeStamp(givenTimeStamp = moment.utc().valueOf()): { timestamp: number, offset: number } {
        // update history and forecast
        const date = moment.utc(givenTimeStamp);
        // get raster minutes
        const minutes = Math.floor(date.minutes() / INTERVAL);
        // calculate start timestamp for processing
        const timestamp = date.startOf('hour').valueOf() + minutes * MILLI_INTERVAL;
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
        let timeBlockCount = 0;
        const result = { history: [], averageWaitingTime: null, averageOccupancy: null };
        result.history = history.filter(value => value.timestamp > lowerBound).map(value => {
            occupanySum += value.occupancy;
            if (value.occupancy > RoomFilling.SEMIFULL) {
                timeSum += INTERVAL / (value.occupancy > RoomFilling.FULL ? 1 : 2);
            }
            if (value.occupancy < RoomFilling.SEMIFULL && lastOccupancy > RoomFilling.SEMIFULL) {
                timeBlockCount++;
            }
            lastOccupancy = value.occupancy;
            return value._id;
        });

        if (history.length > 0) {
            result.averageOccupancy = occupanySum / history.length;
        }
        if (timeBlockCount > 0) {
            result.averageWaitingTime = Math.round((timeSum / timeBlockCount) * MIN_MILLISECOND_FACTOR);
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
            Logger.log(`${room.id} free count ${freeCount} -> send push`, RoomService.name);
            await this.pushService.sendIfFreePush(room);
        }
    }
}
