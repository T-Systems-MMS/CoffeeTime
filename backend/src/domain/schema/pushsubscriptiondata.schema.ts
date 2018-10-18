import { Document, Schema } from 'mongoose';

export const PushSubscriptionDataSchema = new Schema({
    roomId: Schema.Types.String,
    ifFree: {
        type: Schema.Types.Boolean,
        default: false,
    },
    recommendations:  {
        type: Schema.Types.Boolean,
        default: false,
    },
});

export interface PushSubscriptionData extends Document {
    roomId: string;
    ifFree: boolean;
    recommendations: boolean;
}

export const PushSubscriptionModelName = 'PushSubscriptionData';
