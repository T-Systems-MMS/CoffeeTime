import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Push } from './domain/push';
import { PushSubscription } from './domain/pushsubscription';
import { setVapidDetails, sendNotification } from 'web-push';
import { PushModelName, PushData } from './domain/schema/pushdata.schema';
import { PushSubscriptionModelName, PushSubscriptionData } from './domain/schema/pushsubscriptiondata.schema';
import { RoomData } from './domain/schema/roomdata.schema';

const CT_VAPID_PUBLIC_KEY = 'BBkrn3qBt1du3SVflJ2bTGYC7BiKZ8-dN2S2RK0PuaeZkgAKiFxJ-lT0BEMIoIRymFtkt4UY5Jz6S6JPJ1dm5mo';

@Injectable()
export class PushService {
    constructor(
        @InjectModel(PushModelName)
        private readonly pushModel: Model<PushData>,
        @InjectModel(PushSubscriptionModelName)
        private readonly pushSubscriptionModel: Model<PushSubscriptionData>,
    ) {

        if (!process.env.CT_VAPID_PRIVATE_KEY) {
            throw Error('VAPID private key is not set! Please define environment variable CT_VAPID_PRIVATE_KEY.');
        }

        setVapidDetails(
            'mailto:Stefan.Schubert@t-systems.com',
            CT_VAPID_PUBLIC_KEY,
            process.env.CT_VAPID_PRIVATE_KEY,
        );
    }

    update(subscriptionAuth: string, id: string, push: Push): void {
        this.pushModel
            .findOne({ auth: { $eq: subscriptionAuth } }).populate('subscriptions')
            .exec()
            .then(pushModel => {
                const existingSubscription = pushModel.subscriptions.find(
                    element => element.roomId === id,
                );
                const subscription = existingSubscription || new this.pushSubscriptionModel();
                subscription.roomId = id;
                subscription[push.type] = push.value;
                subscription.save();

                if (!existingSubscription) {
                    pushModel.subscriptions.push(subscription);
                    pushModel.save();
                }
            });
    }

    save(pushSubscription: PushSubscription): void {
        const newSubscription = new this.pushModel(pushSubscription);
        newSubscription.save();
    }

    async delete(auth: string): Promise<void> {
        const deleted = await this.pushModel.findOneAndDelete({ auth }).exec();
        await this.pushSubscriptionModel.deleteMany({ _id: { $in: deleted.subscriptions } }).exec();
    }

    async sendIfFreePush(room: RoomData) {
        try {
            // get all subscriptions if ifFree = true
            const pushes: PushSubscriptionData[] = await this.pushSubscriptionModel.find({ ifFree: true, roomId: room.id }).exec();
            const ids: Types.ObjectId[] = pushes.map(p => Types.ObjectId(p._id));
            const subscriptions: PushData[] = await this.pushModel.find({ subscriptions: { $in: ids } }).exec();

            // set all subscriptions to ifFree = false
            for (const p of pushes) {
                p.ifFree = false;
                try {
                    await p.save();
                } catch (error) {
                    Logger.error(error);
                }
            }

            // send push
            Logger.log(`Send if free push for room ${room.name} and ${subscriptions.length} subscriptions.`, PushService.name);
            await this.sendPush(subscriptions, room.id, `${room.name} ist wieder frei.`);
        } catch (error) {
            Logger.error(error);
        }
    }

    async sendRecommendationPush(room: RoomData) {
        try {
            // get all subscriptions if recommendation = true
            const pushes: PushSubscriptionData[] = await this.pushSubscriptionModel.find({ recommendations: true, roomId: room.id }).exec();
            const ids: Types.ObjectId[] = pushes.map(p => Types.ObjectId(p._id));
            const subscriptions: PushData[] = await this.pushModel.find({ subscriptions: { $in: ids } }).exec();
            // send push
            Logger.log(`Send recommendation push for room ${room.name} and ${subscriptions.length} subscriptions.`, PushService.name);
            await this.sendPush(subscriptions, room.id, `${room.name} ist jetzt noch frei. Nutze die Chance.`);
        } catch (error) {
            Logger.error(error);
        }
    }

    private async sendPush(subscriptions: PushData[], roomId: string, message: string): Promise<void> {
        const payload = {
            notification: {
                title: 'CoffeeTime',
                body: message,
                icon: '/assets/icons/icon-192x192.png',
                vibrate: [300, 100, 400],
                data: {
                    roomId,
                },
            },
        };

        for (const s of subscriptions) {
            const pushSubscription = {
                endpoint: s.endpoint,
                keys: {
                    p256dh: s.p256dh,
                    auth: s.auth,
                },
            };

            try {
                await sendNotification(pushSubscription, JSON.stringify(payload), { proxy: process.env.HTTPS_PROXY });
            } catch (error) {
                // delete orphaned subscriptions
                if (error.statusCode === 410) {
                    await this.delete(s.auth);
                } else {
                    Logger.error(error);
                }
            }
        }
    }
}
