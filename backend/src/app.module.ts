import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from './schedule.service';
import { AWSBeService } from './awsbe.service';
import { PushDataSchema, PushModelName } from './domain/schema/pushdata.schema';
import { PushService } from './push.service';
import { PushSubscriptionDataSchema, PushSubscriptionModelName } from './domain/schema/pushsubscriptiondata.schema';
import { RoomDataSchema, RoomModelName } from './domain/schema/roomdata.schema';
import { HistoryModelName, HistorySchema } from 'domain/schema/history.schema';
import { ForecastModelName, ForecastSchema } from 'domain/schema/forecast.schema';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGOLAB_URI, {
            useNewUrlParser: true,
            family: 4,
            useCreateIndex: true,
        }),
        MongooseModule.forFeature([
            { name: PushModelName, schema: PushDataSchema },
            { name: PushSubscriptionModelName, schema: PushSubscriptionDataSchema },
            { name: RoomModelName, schema: RoomDataSchema },
            { name: HistoryModelName, schema: HistorySchema },
            { name: ForecastModelName, schema: ForecastSchema },
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
export class AppModule { }
