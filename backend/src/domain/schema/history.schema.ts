import * as mongoose from 'mongoose';
export const HistorySchema = new mongoose.Schema({
    occupancy: mongoose.Schema.Types.Number,
    timestamp: mongoose.Schema.Types.Number,
}, { id: false});
