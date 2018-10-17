import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from './schedule.service';
import { AWSBeService } from './awsbe.service';
import { PushDataSchema } from './domain/schema/pushdata.schema';
import { PushService } from './push.service';
import { Modelnames } from './domain/schema/modelnames';
import { PushSubscriptionDataSchema } from './domain/schema/pushsubscriptiondata.schema';
import { RoomDataSchema } from './domain/schema/roomdata.schema';
import { ForecastSchema } from './domain/schema/forecast.schema';
import { HistorySchema } from './domain/schema/history.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGOLAB_URI, {
      useNewUrlParser: true,
      family: 4,
    }),
    MongooseModule.forFeature([
      { name: Modelnames.PUSH_DATA, schema: PushDataSchema },
      {
        name: Modelnames.PUSH_SUBSCRIPTION_DATA,
        schema: PushSubscriptionDataSchema,
      },
      { name: Modelnames.ROOM_DATA, schema: RoomDataSchema },
      { name: Modelnames.FORECAST_DATA, schema: ForecastSchema },
      { name: Modelnames.HISTORY_DATA, schema: HistorySchema },
    ]),
  ],
  controllers: [ApiController],
  providers: [
    RoomService,
    PushService,
    ScheduleService,
    AWSBeService,
  ],
})
export class AppModule {}
