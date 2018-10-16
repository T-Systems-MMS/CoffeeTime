import { Document } from 'mongoose';
import { RoomState } from './../roomstate.enum';
import { RoomType } from './../roomtype.enum';
import { ForecastData } from './forecastdata.interface';
import { HistoryData } from './historydata.interface';
export interface RoomData extends Document {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecast: ForecastData[];
    history: HistoryData[];
}