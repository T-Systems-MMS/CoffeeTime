import * as mongoose from 'mongoose';
export const ForecastSchema = new mongoose.Schema({
    occupancy: mongoose.Schema.Types.Number,
    numberOfValues: mongoose.Schema.Types.Number,
    forecastFor: mongoose.Schema.Types.Number,
});
