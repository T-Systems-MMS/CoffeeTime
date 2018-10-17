import { Document, Schema } from 'mongoose';
import { ForecastData, ForecastModelName } from './forecast.schema';
import { HistoryData, HistoryModelName } from './history.schema';
import { RoomType } from './../roomtype.enum';
import { RoomState } from './../roomstate.enum';

export const RoomDataSchema = new Schema({
    id: {
        type: Schema.Types.String,
        required: true,
        unique: true,
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
}, { id: false });

export interface RoomData extends Document {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecast: ForecastData[];
    history: HistoryData[];
}

export const RoomModelName = 'RoomData';
