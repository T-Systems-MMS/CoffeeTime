import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private url = 'https://api.chucknorris.io/jokes/random';

  constructor(private httpClient: HttpClient) { }

  fetchData() { return this.httpClient.get(this.url); }

  getRoom(id: string) {
    console.log('id is:', id);
    return this.httpClient.get(this.url);
  }
}
