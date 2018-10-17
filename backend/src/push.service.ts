import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Push } from './domain/push';
import { PushSubscription } from './domain/pushsubscription';
import { PushModelName, PushData } from './domain/schema/pushdata.schema';
import { PushSubscriptionData, PushSubscriptionModelName } from './domain/schema/pushsubscriptiondata.schema';

@Injectable()
export class PushService {
    constructor(
        @InjectModel(PushModelName)
        private readonly pushModel: Model<PushData>,
        @InjectModel(PushSubscriptionModelName)
        private readonly pushSubscriptionModel: Model<PushSubscriptionData>,
    ) { }

    update(subscriptionAuth: string, id: string, push: Push): void {
        this.pushModel
            .findOne({ auth: { $eq: subscriptionAuth } }).populate('subscriptions')
            .exec()
            .then(pushModel => {
                const existingSubscription = pushModel.subscriptions.find(
                    element => element.roomId === id,
                );
                const subscription =
                    existingSubscription || new this.pushSubscriptionModel();
                subscription.roomId = id;
                subscription.iffree = push.iffree;
                subscription.recommendations = push.recommendations;
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

    delete(auth: string): void {
        this.pushModel.findOneAndDelete({ auth: { $eq: auth } }).populate('subscriptions').exec().then(deleted => {
            this.pushSubscriptionModel.deleteMany(deleted.subscriptions).exec();
        });
    }
}
