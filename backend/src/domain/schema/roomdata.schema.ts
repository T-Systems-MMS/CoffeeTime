import * as mongoose from 'mongoose';
import { ForecastSchema } from './forecast.schema';

export const RoomDataSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    status: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    forecasts: [ForecastSchema],
}, {id: false});
