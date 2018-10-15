import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { verticalLinePlugin } from '../../../components/verticalline.plugin';
import { thresholdPlugin } from '../../../components/threshold.plugin';
import { Room } from '../room';

const STORGE_KEY = 'ct_favorites';
@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

    data = {
        series: [{
            name: 'filling',
            data: [
                { x: new Date('2017-12-27T12:30:00'), y: 20 },
                { x: new Date('2017-12-27T12:31:00'), y: 95 },
                { x: new Date('2017-12-27T12:32:00'), y: 80 },
                { x: new Date('2017-12-27T12:33:00'), y: 30 },
                { x: new Date('2017-12-27T12:34:00'), y: 10 },
                { x: new Date('2017-12-27T12:41:00'), y: 30 },
                { x: new Date('2017-12-27T12:43:00'), y: 30 },
                { x: new Date('2017-12-27T12:43:00'), y: 20 },
                { x: new Date('2017-12-27T12:54:00'), y: 20 },
            ]
        }]
    };
    options = {
        height: 100,
        fullWidth: true,
        axisX: {
            type: FixedScaleAxis,
            divisor: 3,
            labelInterpolationFnc: (value: number) => new Date(value).getHours() + ':' + new Date(value).getMinutes()
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
            thresholdPlugin({ thresholds: [15, 60] }),
            verticalLinePlugin({ label: 'jetzt', position: new Date('2017-12-27T12:37:00').getTime(), className: 'ct-now' })
        ]
    };
    responsiveOptions = [];

    @Input() room: Room;

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
