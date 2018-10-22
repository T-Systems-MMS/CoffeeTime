import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { Interpolation, FixedScaleAxis } from 'chartist';

import { RoomService } from '../room.service';
import { Room } from '../room';
import { RoomListComponent, RoomState, RoomFilling } from '../room-list/room-list.component';
import { PushService } from '../push.service';
import { formatDate } from '@angular/common';
import { thresholdPlugin } from 'src/components/threshold.plugin';
import { verticalLinePlugin } from 'src/components/verticalline.plugin';

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

    options;
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
        this.options = {
            height: 130,
            fullWidth: true,
            axisX: {
                type: FixedScaleAxis,
                divisor: 5,
                labelInterpolationFnc: (value: number) => formatDate(new Date(value), 'HH:mm', 'DE')
            },
            axisY: {
                type: FixedScaleAxis,
                ticks: [0, 50, 100],
                low: 0,
                high: 100,
                showLabel: false,
                offset: 0
            },
            lineSmooth: Interpolation.step(),
            showPoint: false,
            showArea: true,
            plugins: [
                thresholdPlugin({ thresholds: [RoomFilling.SEMIFULL, RoomFilling.FULL], id: this.room.id }),
                verticalLinePlugin({ label: 'jetzt', position: 'now', className: 'ct-now' })
            ]
        };
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
