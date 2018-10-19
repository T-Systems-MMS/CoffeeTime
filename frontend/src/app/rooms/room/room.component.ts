import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';

import { Room } from '../room';
import { RoomListComponent, RoomFilling } from '../room-list/room-list.component';
import { IChartOptions } from 'chartist';

const STORGE_KEY = 'ct_favorites';
const SUFFIX_MAP = {
    area: 'Bereich',
    kitchen: 'Küche',
};
@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

    options: IChartOptions;
    suffix: string;

    @Input()
    room: Room;

    constructor(
        private service: RoomService,
        private router: Router,
        @Inject(LOCAL_STORAGE) private storage: StorageService
    ) { }

    ngOnInit() {
        this.options = RoomListComponent.getChartOptions(true, this.room.id);
        this.suffix = SUFFIX_MAP[this.room.type];
    }

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

    get isIfFreeDisabled() {
        return this.room.history.length === 0 || this.room.history[this.room.history.length - 1].occupancy >= RoomFilling.SEMIFULL;
    }
}
