import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../room.service';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  room;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: RoomService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.room = this.service.getRoom(id);
  }

  gotoRooms() {
    this.router.navigate(['/rooms']);
  }
}
