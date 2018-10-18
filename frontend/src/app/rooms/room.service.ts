import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from './room';
import { PushService } from './push.service';

const ROOMS_URL = '/api/rooms';
const ROOM_URL = '/api/room';

type pushTypes = 'ifFree' | 'recommendations';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private http: HttpClient,
    private push: PushService,
  ) { }

  public getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(ROOMS_URL);
  }

  public getRoom(id: string): Observable<Room> {
    return this.http.get<Room>(`${ROOM_URL}/${id}`);
  }

  public togglePush(room: Room, type: pushTypes, active: boolean): void {
    this.push.getAuthToken().then((auth_token) => {
      this.http.put(`${ROOM_URL}/${room.id}/push`,
        {
          type: type,
          value: active
        }, {
          headers: new HttpHeaders({
            'PUSH_SUBSCRIPTION_AUTH': auth_token
          })
        }).subscribe();
    });
  }
}
