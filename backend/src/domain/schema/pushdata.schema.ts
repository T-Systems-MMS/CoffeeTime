import * as mongoose from 'mongoose';
import { Modelnames } from './modelnames';

export const PushDataSchema = new mongoose.Schema({
    endpoint:  {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    auth: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    p256dh: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    subscriptions: [{type: mongoose.Schema.Types.ObjectId, ref: Modelnames.PUSH_SUBSCRIPTION_DATA}],
});
