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
  ) {
    this.room = {};
   }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.service.getRoom(id).subscribe((response) => {
      this.room = response;
    });
  }

  gotoRooms() {
    this.router.navigate(['/rooms']);
  }
}
