import { Component, OnInit, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';

import { Room } from '../room';
import { RoomListComponent, RoomState } from '../room-list/room-list.component';
import { IChartOptions } from 'chartist';
import { PushService } from '../push.service';

const STORGE_KEY = 'ct_favorites';
export const SUFFIX_MAP = {
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
    pushAvailable: boolean;
    statusmap: {
        [RoomState.FULL]: string,
        [RoomState.SEMIFULL]: string,
        [RoomState.FREE]: string
    };

    @Input()
    room: Room;

    constructor(
        private service: RoomService,
        private router: Router,
        private push: PushService,
        @Inject(LOCAL_STORAGE) private storage: StorageService,
    ) { }

    ngOnInit() {
        this.options = RoomListComponent.getChartOptions(true, this.room.id);
        this.suffix = SUFFIX_MAP[this.room.type];
        this.statusmap = {
            [RoomState.FULL]: 'voll',
            [RoomState.SEMIFULL]: 'gefüllt',
            [RoomState.FREE]: 'frei'
        };
        this.pushAvailable = this.push.isPushAvailable();
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

    toogleIfFreePush(event: MatSlideToggleChange) {
        this.service.togglePush(this.room, 'ifFree', event.checked)
            .then(() => {
                if (!this.room.push) {
                    this.room.push = { ifFree: false, recommendations: false };
                }
                this.room.push.ifFree = event.checked;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    toogleRecommendationsPush(event: MatSlideToggleChange) {
        this.service.togglePush(this.room, 'recommendations', event.checked)
            .then(() => {
                if (!this.room.push) {
                    this.room.push = { ifFree: false, recommendations: false };
                }
                this.room.push.recommendations = event.checked;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    gotoRoomDetails(): void {
        this.router.navigateByUrl(`/room/${this.room.id}`);
    }

    get isIfFreeDisabled() {
        return this.room.status === RoomState.FREE && (!this.room.push || !this.room.push.ifFree);
    }
}
