import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../room.service';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { thresholdPlugin } from '../../../components/threshold.plugin';
import { Room } from '../room';
import { Subscription } from 'rxjs';
import { RoomListComponent } from '../room-list/room-list.component';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { SUFFIX_MAP } from '../room/room.component';

@Component({
    selector: 'app-room-detail',
    templateUrl: './room-detail.component.html',
    styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, OnDestroy {
    room: Room;
    roomLabel = '';
    private _subscription: Subscription;

    options = RoomListComponent.getChartOptions();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: RoomService
    ) {
        this.room = null;
        this.options.axisX.divisor = 5;
        this.options.axisX.labelInterpolationFnc = (value: number) => formatDate(new Date(value), 'EE HH:mm', 'DE');
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
}
