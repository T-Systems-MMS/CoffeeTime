import { Document } from 'mongoose';
export interface PushSubscriptionData extends Document {
    roomId: string;
    iffree: boolean;
    recommendations: boolean;
}