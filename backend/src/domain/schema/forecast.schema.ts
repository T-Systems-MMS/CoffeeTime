import * as mongoose from 'mongoose';
import * as moment from 'moment';
export const ForecastSchema = new mongoose.Schema({
    occupancy: mongoose.Schema.Types.Number,
    numberOfValues: mongoose.Schema.Types.Number,
    forecastFor: mongoose.Schema.Types.Number,
}, { id: false, toJSON: { virtuals: true }});
ForecastSchema.virtual('timestamp').get(function() {
    const now = moment().locale('de');
    return now.hours(Math.trunc(this.forecastFor / 100))
    .minutes(this.forecastFor % 60)
    .seconds(0)
    .milliseconds(0)
    .utc();
});
