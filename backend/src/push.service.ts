import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PushData } from 'domain/schema/pushdata.interface';
import { Model } from 'mongoose';
import { Push } from 'domain/push';
import { PushSubscription } from 'domain/pushsubscription';
import { PushSubscriptionData } from 'domain/schema/pushsubscriptiondata.interface';
import { Modelnames } from 'domain/schema/modelnames';

@Injectable()
export class PushService {
  constructor(
    @InjectModel(Modelnames.PUSH_DATA)
    private readonly pushModel: Model<PushData>,
    @InjectModel(Modelnames.PUSH_SUBSCRIPTION_DATA)
    private readonly pushSubscriptionModel: Model<PushSubscriptionData>,
  ) {}

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
