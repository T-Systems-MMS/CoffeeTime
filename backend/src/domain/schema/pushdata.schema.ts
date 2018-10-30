import { Document, Schema } from 'mongoose';
import { PushSubscriptionModelName, PushSubscriptionData } from './pushsubscriptiondata.schema';

export const PushDataSchema = new Schema({
    endpoint: {
        type: Schema.Types.String,
        required: true,
    },
    auth: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        index: true,
    },
    p256dh: {
        type: Schema.Types.String,
        required: true,
    },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: PushSubscriptionModelName }],
});

export interface PushData extends Document {
    endpoint: string;
    auth: string;
    p256dh: string;
    subscriptions: PushSubscriptionData[];
}

export const PushModelName = 'PushData';