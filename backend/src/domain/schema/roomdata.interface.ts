import { Document } from 'mongoose';
import { RoomState } from 'domain/roomstate.enum';
import { RoomType } from 'domain/roomtype.enum';
import { ForecastData } from './forecastdata.interface';
export interface RoomData extends Document {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecasts: ForecastData[];
}