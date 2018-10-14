import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from 'schedule.service';
import { AWSBeService } from 'awsbe.service';
import { StorageService } from 'storage.service';
import { PushDataSchema } from 'domain/schema/pushdata.schema';
import { PushService } from 'push.service';
import { Modelnames } from 'domain/schema/modelnames';
import { Logger } from 'mongodb';
import { PushSubscriptionDataSchema } from 'domain/schema/pushsubscriptiondata.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGOLAB_URI,
      {
        useNewUrlParser: true,
        family: 4,
      }),
    MongooseModule.forFeature(
      [
        {name: Modelnames.PUSH_DATA, schema: PushDataSchema},
        {name: Modelnames.PUSH_SUBSCRIPTION_DATA, schema: PushSubscriptionDataSchema},
      ],
    ),
  ],
  controllers: [ApiController],
  providers: [RoomService, PushService, ScheduleService, AWSBeService, StorageService],
})
export class AppModule {}
