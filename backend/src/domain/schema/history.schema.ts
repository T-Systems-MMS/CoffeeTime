import { Document, Schema } from 'mongoose';

export const HistorySchema = new Schema({
    occupancy: Schema.Types.Number,
    timestamp: {
        type: Schema.Types.Number,
        index: true,
    },
}, { id: false });

export interface HistoryData extends Document {
    occupancy: number;
    timestamp: number;
}

export const HistoryModelName = 'HistoryData';
