import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from './room';
import { PushService, STORAGE_KEY } from './push.service';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';
import { environment } from '../../environments/environment';

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
        @Inject(LOCAL_STORAGE) private storage: StorageService,
    ) { }

    public getRooms(): Observable<Room[]> {
        const auth_token = this.storage.get(STORAGE_KEY);
        if (auth_token) {
            return this.http.get<Room[]>(`${environment.baseUrl}${ROOMS_URL}`,
                { headers: new HttpHeaders({ 'PUSH_SUBSCRIPTION_AUTH': auth_token }) });
        } else {
            return this.http.get<Room[]>(`${environment.baseUrl}${ROOMS_URL}`);
        }
    }

    public getRoom(id: string): Observable<Room> {
        return this.http.get<Room>(`${environment.baseUrl}${ROOM_URL}/${id}`);
    }

    public togglePush(room: Room, type: pushTypes, active: boolean): Promise<any> {
        return this.push.getAuthToken()
            .then(auth_token => {
                return this.http.put(`${environment.baseUrl}${ROOM_URL}/${room.id}/push`,
                    {
                        type: type,
                        value: active
                    }, {
                        headers: new HttpHeaders({
                            'PUSH_SUBSCRIPTION_AUTH': auth_token
                        })
                    }).toPromise();
            });
    }
}
