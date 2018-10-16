import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { RoomService } from '../room.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Subscription, timer, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { verticalLinePlugin } from '../../../components/verticalline.plugin';
import { thresholdPlugin } from '../../../components/threshold.plugin';
import { formatDate } from '@angular/common';

const STORGE_KEY = 'ct_favorites';

const STATUS_MAP = {
    full: 'voll',
    semifull: 'gefüllt',
    free: 'frei'
};

const TIMER_DELAY = 5000; // 5 seconds delay
const TIMER_INTERVAL = 1000;//60000; // 1 minute interval

@Component({
    selector: 'app-room-list',
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, OnDestroy {
    rooms = [];
    favoriteRooms = [];
    timerSubscription: Subscription = null;

    constructor(
        private service: RoomService,
        @Inject(LOCAL_STORAGE) private storage: StorageService,
        private ngZone: NgZone
    ) { }

    static mapForecastOrHistory(room) {
        const property = room.history ? 'history' : 'forecast';
        room[property] = room[property].map(item => {
            return { x: new Date(item.timestamp), y: Math.ceil(item.occupancy * 100) }
        });
        room[property] = {
            series: [{
                name: 'filling',
                data: room[property]
            }]
        }
        return room;
    }

    static getChartOptions(withNow = false) {
        const plugins: Function[] = [
            thresholdPlugin({ thresholds: [15, 60] })
        ];
        if (withNow) {
            plugins.push(verticalLinePlugin({ label: 'jetzt', position: Date.now(), className: 'ct-now' }))
        }
        return {
            height: 100,
            fullWidth: true,
            axisX: {
                type: FixedScaleAxis,
                divisor: 3,
                labelInterpolationFnc: (value: number) => formatDate(new Date(value), 'dd:mm', 'EN')
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
            plugins: plugins
        }
    }

    ngOnInit() {
        this.fetchRooms();
        // workaround: run timer outside of angular (https://github.com/angular/angular/issues/20970)
        this.ngZone.runOutsideAngular(() => {
            this.timerSubscription = timer(TIMER_DELAY, TIMER_INTERVAL)
                .subscribe(() => {
                    this.ngZone.run(() => {
                        const roomSubscription = this.service.getRooms()
                            .pipe(switchMap(rooms => from(rooms)))
                            .pipe(map(room => RoomListComponent.mapForecastOrHistory(room)))
                            .subscribe(
                                updatedRoom => {
                                    [...this.rooms, ...this.favoriteRooms].forEach(room => {
                                        if (room.id === updatedRoom.id) {
                                            room.forecast = updatedRoom.forecast;
                                        }
                                    });
                                },
                                error => { console.log(error); },
                                () => roomSubscription.unsubscribe()
                            );
                    })
                });
        });
    }

    ngOnDestroy() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
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
        const roomSubscription = this.service.getRooms()
            .pipe(switchMap(rooms => {
                this.favoriteRooms = [];
                this.rooms = [];
                return from(rooms);
            }))
            .pipe(map(room => RoomListComponent.mapForecastOrHistory(room)))
            .subscribe(
                room => {
                    // set some attributes
                    room.favorite = favorites.indexOf(room.id) !== -1;
                    room.status = STATUS_MAP[room.status];

                    if (room.favorite) {
                        this.favoriteRooms.push(room);
                    } else {
                        this.rooms.push(room);
                    }
                },
                error => { console.log(error); },
                () => roomSubscription.unsubscribe()
            );
    }

}
