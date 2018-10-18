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

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(RoomModelName)
        private readonly roomModel: Model<RoomData>,
        @InjectModel(HistoryModelName)
        private readonly historyModel: Model<HistoryData>,
        @InjectModel(ForecastModelName)
        private readonly forecastModel: Model<ForecastData>,
    ) { }

    rooms(subscriptionAuth?: string): Promise<Array<RoomData>> {
        const from = moment.utc().subtract(2, 'hours').valueOf();
        const now = moment.utc().valueOf() - moment.utc().startOf('day').valueOf();
        const to = now + HOUR_MILLIS;
        return this.roomModel
            .find({}, { _id: 0, __v: 0 })
            .populate({
                path: 'forecast',
                match: { offset: { $gt: now, $lt: to } },
                select: '-_id -occupancyValues',
            })
            .populate({
                path: 'history',
                match: { timestamp: { $gt: from } },
                select: '-_id',
            })
            .exec();
    }
    room(roomId: string): Promise<RoomData> {
        return this.roomModel
            .findOne({ id: roomId }, { _id: 0, __v: 0, forecast: 0 })
            .populate({
                path: 'history',
                select: '-_id',
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
            // update history and forecast
            const date = moment.utc(fillings[0].timestamp);
            // get raster minutes
            const minutes = Math.floor(date.minutes() / INTERVAL);
            // calculate start timestamp for processing
            let timestamp = date.startOf('hour').valueOf() + minutes * MILLI_INTERVAL;
            // start offset for forecast
            let offset = moment.utc(timestamp).valueOf() - date.startOf('day').valueOf();
            // upper timestamp to check time slot end
            let nextTimestamp = timestamp + MILLI_INTERVAL;
            let sum = 0;
            let count = 0;
            // last processed timestamp
            const lastTimestamp = room.history.length > 0 ? room.history[room.history.length - 1].timestamp : 0;
            // tslint:disable-next-line:max-line-length
            Logger.log(`${room.id} offset: ${offset} time: ${moment.utc(timestamp).format()} next: ${moment.utc(nextTimestamp).format()}`);

            for (const filling of fillings) {
                // time slot over? -> ATTENTION: the last slot is ignored, because it is processed next time with all values present
                if (filling.timestamp >= nextTimestamp) {
                    // at least one value is needed and timestamp should not already processed
                    if (timestamp > lastTimestamp && count > 0) {
                        // average value
                        const occupancy = sum / count;

                        Logger.log(`history ${room.id} time: ${moment.utc(timestamp).format()} occupancy: ${occupancy}`);

                        // add new history item
                        const newHistory = new this.historyModel({ _id: new Types.ObjectId(), occupancy, timestamp });
                        await newHistory.save();
                        room.history.push(newHistory);

                        // caculate forecast occupancy
                        const occupancies = await this.calculateForecastOccupancy(forecastMap, occupancy, offset);
                        Logger.log(`forecast ${room.id} offset: ${offset} occupancy: ${occupancies[0]} -> ${occupancies[1]}`);
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

            // update history and set average values
            const result = this.filterHistoryAndCalcAverage(room.history);
            room.history = result.history;
            room.averageWaitingTime = result.averageWaitingTime;
            room.averageOccupancy = result.averageOccupancy;

            return room;
        } catch (e) {
            Logger.error(e);
        }
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

    private filterHistoryAndCalcAverage(history: any[]): { history: any[], averageWaitingTime: number, averageOccupancy: number } {
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
}
