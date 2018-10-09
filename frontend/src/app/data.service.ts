import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private url = 'https://api.chucknorris.io/jokes/random';

  constructor(private httpClient: HttpClient) { }

  fetchData() { return this.httpClient.get(this.url); }
}
