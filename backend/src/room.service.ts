import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Modelnames } from 'domain/schema/modelnames';
import { RoomData } from 'domain/schema/roomdata.interface';
import { Model } from 'mongoose';
import { Filling } from 'domain/filling';
import { RoomType } from 'domain/roomtype.enum';
import { RoomState } from 'domain/roomstate.enum';
import { ForecastData } from 'domain/schema/forecastdata.interface';
import { HistoryData } from 'domain/schema/historydata.interface';
import * as moment from 'moment';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Modelnames.ROOM_DATA)
    private readonly roomModel: Model<RoomData>,
    @InjectModel(Modelnames.FORECAST_DATA)
    private readonly forecastModel: Model<ForecastData>,
    @InjectModel(Modelnames.HISTORY_DATA)
    private readonly historyModel: Model<HistoryData>,
  ){}

  rooms(): Promise<Array<RoomData>> {
    return this.roomModel
      .find({}, {'_id' : 0, '__v': 0,  'history': 0, 'forecasts.numberOfValues': 0 })
      .populate({
        path: 'forecasts',
        select: '-_id',
      })
      .exec();
  }
  room(roomId: string){
    return this.roomModel
    .findOne({id: roomId}, {_id : 0, __v: 0,  forecasts: 0 })
      .populate({
        path: 'history',
        select: '-_id',
      })
      .exec();
  }

  updateRoom(location: string, fillings: Filling[]): void {
    this.roomModel.findOne({id: location}).then(room => {
      if (!room){
        room = new this.roomModel();
        for (let i = 0; i <= 2355; i = i + 5){
          if ( i % 100 === 60 ){
            i = i + 40;
          }
          const emptyForecast = new this.forecastModel({occupancy: 0, numberOfValues: 0, forecastFor: i});
          room.forecasts.push(emptyForecast);
        }
      }
      room.id = location;
      room.name = location;
      room.type = location.startsWith('sitz') ? RoomType.AREA : RoomType.KITCHEN;
      room.status = fillings[0].filling > 0.75 ? RoomState.FULL : (fillings[0].filling > 0.5 ?  RoomState.SEMIFULL : RoomState.FREE);
      fillings.forEach(filling => {
        const index = room.history.findIndex(value => value.timestamp === filling.timestamp.getTime());
        if (index === -1){
          room.history.push(new this.historyModel({occupancy: filling.filling, timestamp: filling.timestamp.getTime()}));
        }
      });
      const lowerBound = moment().add(-3, 'days').unix();
      room.history = room.history.filter(value => value.timestamp > lowerBound);
      room.save();
    });
  }

}
