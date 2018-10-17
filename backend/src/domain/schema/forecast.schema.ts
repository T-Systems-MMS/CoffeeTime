import { Document, Schema } from 'mongoose';
import * as moment from 'moment';

export const ForecastSchema = new Schema({
    occupancyValues: [Schema.Types.Number],
    occupancy: Schema.Types.Number,
    offset: Schema.Types.Number,
}, { id: false, toJSON: { virtuals: true } });

ForecastSchema.virtual('timestamp').get(function() {
    const startOfDay = moment().utc().startOf('day').valueOf();
    return this.offset + startOfDay;
});

export interface ForecastData extends Document {
    occupancy: number;
    occupancyValues: number[];
    // offset from 00:00:00 in milliseconds
    offset: number;
    timestamp?: number;
}

export const ForecastModelName = 'ForecastData';
