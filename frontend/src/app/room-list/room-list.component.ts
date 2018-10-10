import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

  joke = null;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.dataService.fetchData().subscribe(
      response => { this.joke = response; },
      error => { console.log(error); }
    );
  }

}
