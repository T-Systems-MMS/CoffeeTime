import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Modelnames } from 'domain/schema/modelnames';
import { RoomData } from 'domain/schema/roomdata.interface';
import { Model } from 'mongoose';
import { Filling } from 'domain/filling';
import { RoomType } from 'domain/roomtype.enum';
import { RoomState } from 'domain/roomstate.enum';
import { ForecastData } from 'domain/schema/forecastdata.interface';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Modelnames.ROOM_DATA)
    private readonly roomModel: Model<RoomData>,
    @InjectModel(Modelnames.FORECAST_DATA)
    private readonly forecastModel: Model<ForecastData>,
  ){}

  rooms(): Promise<Array<RoomData>> {
    return this.roomModel
      .find({}, {'_id' : 0, '__v': 0,  'forecasts.numberOfValues': 0 })
      .populate({
        path: 'forecasts',
        select: '-_id',
        match : {occupancy: 110},
      })
      .exec();
  }
  room(roomId: string){
        const history = [];
        const now = Date.now();
        for (let i = -(50 * 18000000); i < 0; i += 18000000) {
            history.push({ timestamp: now + i, occupancy: Math.random() });
        }
    return {
            id: roomId,
      name: 'Raum der Stille',
            type: RoomType.AREA,
            history,
      averageWaitingTime: 124,
      averageOccupancy: 0.475,
     };
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
      room.save();
    });
  }

}
