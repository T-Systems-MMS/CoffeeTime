import { Injectable, Optional, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private url = 'https://api.chucknorris.io/jokes/random';

  constructor(
    private httpClient: HttpClient,
    @Optional() @Inject(APP_BASE_HREF) origin: string
  ) {
    console.log('app base is:', origin);
  }

  fetchData() { return this.httpClient.get(this.url); }
}
