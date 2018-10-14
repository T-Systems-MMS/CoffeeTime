import * as mongoose from 'mongoose';

export const PushSubscriptionDataSchema = new mongoose.Schema({
    roomId: mongoose.Schema.Types.String,
    iffree: {
        type: mongoose.Schema.Types.Boolean,
        default: false,
    },
    recommendations:  {
        type: mongoose.Schema.Types.Boolean,
        default: false,
    },
});
