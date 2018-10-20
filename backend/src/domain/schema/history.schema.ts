import { Document, Schema } from 'mongoose';

export const HistorySchema = new Schema({
    occupancy: Schema.Types.Number,
    timestamp: Schema.Types.Number,
}, { id: false });

export interface HistoryData extends Document {
    occupancy: number;
    timestamp: number;
}

export const HistoryModelName = 'HistoryData';
