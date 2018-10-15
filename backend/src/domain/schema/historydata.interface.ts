import { Document } from 'mongoose';

export interface HistoryData extends Document {
    occupancy: number;
    timestamp: number;
}