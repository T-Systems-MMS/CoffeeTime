import { Document } from 'mongoose';

export interface ForecastData extends Document{
    occupancy: number;
    numberOfValues: number;
    // Format: HHmm
    forecastFor: number;
}