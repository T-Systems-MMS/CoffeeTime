import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
const MILLI_INTERVAL = INTERVAL * MIN_MILLISECOND_FACTOR;
const MAX_FORECAST_VALUES = 4;
const HOUR_MILLIS = 60 * 60 * 1000;

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
        return this.roomModel
            .find({}, { '_id': 0, '__v': 0, 'history': 0, 'forecast.numberOfValues': 0 })
            .populate({
                path: 'forecast',
                select: '-_id',
            })
            .exec();
    }
    room(roomId: string) {
        return this.roomModel
            .findOne({ id: roomId }, { _id: 0, __v: 0, forecast: 0 })
            .populate({
                path: 'history',
                select: '-_id',
            })
            .exec();
    }

    updateRoom(location: string, fillings: Filling[]): void {
        this.roomModel.findOne({ id: location }).then(room => {
            if (!room) {
                room = new this.roomModel();
                // set general values
                room.id = location;
                room.name = location.charAt(0).toUpperCase() + location.slice(1);
                room.type = location.startsWith('sitz') ? RoomType.AREA : RoomType.KITCHEN;
            }
            // prepare forecast processing
            const forecastMap = room.forecast.reduce((memo, forecast) => {
                memo.set(forecast.offset + 'ms', forecast);
                return memo;
            }, new Map<string, ForecastData>());
            // sort to have correct order
            fillings = fillings.sort((p, n) => p.timestamp - n.timestamp);

            // update status
            const firstFilling = fillings[0].filling;
            room.status = firstFilling > RoomFilling.FULL
                ? RoomState.FULL
                : (firstFilling > RoomFilling.SEMIFULL ? RoomState.SEMIFULL : RoomState.FREE);

            // update history and forecast
            const date = moment.utc(fillings[0].timestamp);
            const minutes = Math.floor(date.minutes() / INTERVAL);
            let offset = minutes * MILLI_INTERVAL;
            let timestamp = date.startOf('hour').valueOf() + offset;
            let nextTimestamp = timestamp + MILLI_INTERVAL;
            let sum = 0;
            let count = 0;
            const lastTimestamp = room.history.length > 0 ? room.history[room.history.length - 1].timestamp : 0;
            // tslint:disable-next-line:max-line-length
            Logger.log(`Start for ${room.id} time: ${moment.utc(fillings[0].timestamp).format()} with offset: ${offset / MIN_MILLISECOND_FACTOR} time: ${moment.utc(timestamp).format()} next: ${moment.utc(nextTimestamp).format()}.`);
            fillings.forEach(filling => {
                if (filling.timestamp >= nextTimestamp) {
                    if (timestamp > lastTimestamp && count > 0) {
                        const occupancy = sum / count;
                        Logger.log(`Add new history entry for ${room.id} time: ${moment.utc(timestamp).format()} occupancy: ${occupancy}.`);
                        room.history.push(new this.historyModel({ occupancy, timestamp }));
                        if (!forecastMap.has(offset + 'ms')) {
                            forecastMap.set(offset + 'ms', new this.forecastModel({ occupancy, occupancyValues: [occupancy], offset }));
                        }
                        const forecast = forecastMap.get(offset + 'ms');
                        if (forecast.occupancyValues.length >= MAX_FORECAST_VALUES) {
                            forecast.occupancyValues.shift();
                        }
                        const newLength = forecast.occupancyValues.push(occupancy);
                        const newOccupancy = forecast.occupancyValues.reduce((valueSum, value) => valueSum + value, 0) / newLength;
                        // tslint:disable-next-line:max-line-length
                        Logger.log(`Update forecast for ${room.id} offset: ${offset / MIN_MILLISECOND_FACTOR} occupancy: ${forecast.occupancy} -> ${newOccupancy}.`);
                        forecast.occupancy = newOccupancy;
                    }
                    timestamp = nextTimestamp;
                    offset += MILLI_INTERVAL;
                    offset = offset % HOUR_MILLIS;
                    nextTimestamp = timestamp + MILLI_INTERVAL;
                    sum = 0;
                    count = 0;
                }

                sum += filling.filling;
                count++;
            });
            // filter old elements
            const lowerBound = moment().utc().subtract(7, 'days').valueOf();
            room.history = room.history.filter(value => value.timestamp > lowerBound);
            // set forecast
            room.forecast = Array.from(forecastMap.values());
            room.forecast.sort((p, n) => p.offset - n.offset);
            room.save();
        });
    }
}
