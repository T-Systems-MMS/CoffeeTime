import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../room.service';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { thresholdPlugin } from '../../../components/threshold.plugin';
import { Room } from '../room';
import { Subscription } from 'rxjs';
import { RoomListComponent, RoomFilling } from '../room-list/room-list.component';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { SUFFIX_MAP } from '../room/room.component';

const SCROLL_STEP = 40;

@Component({
    selector: 'app-room-detail',
    templateUrl: './room-detail.component.html',
    styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, OnDestroy {
    room: Room;
    roomLabel = '';
    options;
    private _subscription: Subscription;


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: RoomService
    ) {
        this.room = null;
        this.options = {
            height: 150,
            fullWidth: true,
            axisX: {
                type: FixedScaleAxis,
                divisor: 36,
                labelInterpolationFnc: (value: number) => formatDate(new Date(value), 'EE HH:mm', 'DE')
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
            plugins: [thresholdPlugin({ thresholds: [RoomFilling.SEMIFULL, RoomFilling.FULL], id: 'detail' })]
        };
    }

    ngOnInit(): void {
        const id: string = this.route.snapshot.paramMap.get('id');
        this._subscription = this.service.getRoom(id)
            .pipe(map(room => RoomListComponent.mapForecastOrHistory(room)))
            .subscribe(room => {
                this.room = room;
                this.roomLabel = `${room.name} (${SUFFIX_MAP[this.room.type]})`;
            });
    }

    ngOnDestroy(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    gotoRooms(): void {
        this.router.navigate(['/rooms']);
    }

    handleScroll(event) {
        event.preventDefault();
        const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        event.currentTarget.scrollLeft -= (delta * SCROLL_STEP);
    }
}
