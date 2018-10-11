import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomService } from '../room.service';


@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

  joke = null;

  constructor(private roomService: RoomService) { }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.roomService.fetchData().subscribe(
      response => { this.joke = response; },
      error => { console.log(error); }
    );
  }



}
