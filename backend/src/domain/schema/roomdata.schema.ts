import { Document, Schema } from 'mongoose';
import { ForecastData, ForecastModelName } from './forecast.schema';
import { HistoryData, HistoryModelName } from './history.schema';
import { RoomType } from './../roomtype.enum';
import { RoomState } from './../roomstate.enum';
import { Logger } from '@nestjs/common';

export const RoomDataSchema = new Schema({
    id: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: Schema.Types.String,
        required: true,
    },
    status: {
        type: Schema.Types.String,
        required: true,
    },
    type: {
        type: Schema.Types.String,
        required: true,
    },
    forecast: [{ type: Schema.Types.ObjectId, ref: ForecastModelName }],
    history: [{ type: Schema.Types.ObjectId, ref: HistoryModelName }],
    averageWaitingTime: {
        type: Schema.Types.Number,
    },
    averageOccupancy: {
        type: Schema.Types.Number,
    },
}, { id: false });

let startTime;
RoomDataSchema.pre('aggregate', function() {
    startTime = Date.now();
});

RoomDataSchema.post('aggregate', function() {
    if (startTime) {
        Logger.log(`${JSON.stringify(this)}: ${Date.now() - startTime}ms`, 'RoomDataSchema');
    }
});

export interface RoomData extends Document {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecast: ForecastData[];
    history: HistoryData[];
    averageWaitingTime: number;
    averageOccupancy: number;
}

export const RoomModelName = 'RoomData';
