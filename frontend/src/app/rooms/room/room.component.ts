import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';

import { Room } from '../room';
import { RoomListComponent } from '../room-list/room-list.component';

const STORGE_KEY = 'ct_favorites';
@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

    options = RoomListComponent.getChartOptions(true);

    @Input()
    room: Room;

    constructor(
        private service: RoomService,
        private router: Router,
        @Inject(LOCAL_STORAGE) private storage: StorageService
    ) { }

    ngOnInit() { }

    toogleFavorite(): void {
        this.room.favorite = !this.room.favorite;

        // get favorites from storage and remove current room-id if present
        const favorites = (this.storage.get(STORGE_KEY) || []).filter(id => id !== this.room.id);

        if (this.room.favorite) {
            favorites.push(this.room.id);
        }

        this.storage.set(STORGE_KEY, favorites);
    }

    toogleIfFreePush(event: MatSlideToggleChange): void {
        this.service.togglePush(this.room, 'ifFree', event.checked);
    }

    toogleRecommendationsPush(event: MatSlideToggleChange): void {
        this.service.togglePush(this.room, 'recommendations', event.checked);
    }

    gotoRoomDetails(): void {
        this.router.navigateByUrl(`/room/${this.room.id}`);
    }
}
