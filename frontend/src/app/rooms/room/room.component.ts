import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { SwPush } from '@angular/service-worker';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { viewParentEl } from '@angular/core/src/view/util';
import { PushService } from '../push.service';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';

const STORGE_KEY = 'ct_favorites';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() room;

  constructor(
    private service: RoomService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) { }

  ngOnInit() {
  }

  public toogleFavorite() {
    this.room.favorite = !this.room.favorite;

    // get favorites from storage and remove current room-id if present
    const favorites = (this.storage.get(STORGE_KEY) || []).filter(id => id !== this.room.id);

    if (this.room.favorite) {
      favorites.push(this.room.id);
    }

    this.storage.set(STORGE_KEY, favorites);
  }

  public toogleIfFreePush(event: MatSlideToggleChange) {
    this.service.togglePush(this.room, 'ifFree', event.checked);
  }

  public toogleRecommendationsPush(event: MatSlideToggleChange) {
    this.service.togglePush(this.room, 'recommendations', event.checked);
  }

  public gotoRoomDetails() {
    this.router.navigateByUrl(`/room/${this.room.id}`);
  }
}
