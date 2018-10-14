import { Document } from 'mongoose';
import { PushSubscriptionData } from './pushsubscriptiondata.interface';
export interface PushData extends Document {
    endpoint: string;
    auth: string;
    p256dh: string;
    subscriptions: PushSubscriptionData[];
}