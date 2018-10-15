import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { RoomService } from '../room.service';
import { Room } from '../room';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Subscription } from 'rxjs';

const STORGE_KEY = 'ct_favorites';

const STATUS_MAP = {
  full: 'voll',
  semifull: 'gefüllt',
  free: 'frei'
};

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, OnDestroy {
  rooms = [];
  favoriteRooms = [];
  subscription: Subscription = null;

  constructor(
    private service: RoomService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) { }

  ngOnInit() {
    this.fetchRooms();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  hasRooms(): boolean {
    return this.rooms.length > 0;
  }

  hasFavoriteRooms(): boolean {
    return this.favoriteRooms.length > 0;
  }

  /**
   * Get rooms from the backend and do some post-processing.
   */
  private fetchRooms() {
    // get current list of favorite room-ids from locale storage
    const favorites = this.storage.get(STORGE_KEY) || [];

    // get data from backend
    this.subscription = this.service.getRooms().subscribe(
      response => {
        this.favoriteRooms = [];
        this.rooms = [];

        // set some attributes
        response.forEach((room) => {
          room.favorite = favorites.indexOf(room.id) !== -1;
          room.status = STATUS_MAP[room.status];

          if (room.favorite) {
            this.favoriteRooms.push(room);
          } else {
            this.rooms.push(room);
          }

        });
      },
      error => { console.log(error); }
    );
  }

}
