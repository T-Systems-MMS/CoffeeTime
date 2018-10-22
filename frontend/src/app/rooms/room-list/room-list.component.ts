import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { RoomService } from '../room.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Subscription, timer, from, of, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { EventManager } from '@angular/platform-browser';

const STORGE_KEY = 'ct_favorites';

export enum RoomState {
    FULL = 'full',
    SEMIFULL = 'semifull',
    FREE = 'free',
}

const TIMER_INTERVAL = 60000; // 1 minute interval
const HOUR_MILLIS = 60 * 60 * 1000;

export enum RoomFilling {
    SEMIFULL = 20,
    FULL = 75,
}

@Component({
    selector: 'app-room-list',
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, OnDestroy {
    rooms = [];
    favoriteRooms = [];
    waitForloading = true;
    timerObservable: Observable<number>;
    timerSubscription: Subscription = null;
    unSubscribeVisibilityChange: Function;

    constructor(
        private service: RoomService,
        @Inject(LOCAL_STORAGE) private storage: StorageService,
        private ngZone: NgZone,
        private eventManager: EventManager,
        @Inject(DOCUMENT) private document: any
    ) { }

    static mapForecastOrHistory(room, concat = false) {
        ['history', 'forecast'].forEach((property) => {
            if (room[property]) {
                room[property] = room[property].map(item => {
                    return { x: new Date(item.timestamp), y: Math.ceil(item.occupancy * 100) };
                });
                room[property] = {
                    series: [{
                        name: 'filling',
                        data: room[property]
                    }]
                };
            }
        });
        if (concat && room.forecast && room.history) {
            const forecast = room.forecast.series[0].data.length > 0 ? room.forecast.series[0].data : this.getFallBackForecast();
            room.forecast.series[0].data = room.history.series[0].data.concat(forecast);
        }
        return room;
    }

    private static getFallBackForecast() {
        return [{ y: 0, x: new Date(Date.now()) }, { y: 0, x: new Date(Date.now() + HOUR_MILLIS) }];
    }

    ngOnInit() {
        this.fetchRooms();
        // workaround: run timer outside of angular (https://github.com/angular/angular/issues/20970)
        const timeHandler = () => {
            this.ngZone.run(() => {
                this.updateRooms();
            });
        };
        this.ngZone.runOutsideAngular(() => {
            this.timerObservable = timer(TIMER_INTERVAL, TIMER_INTERVAL);
            this.timerSubscription = this.timerObservable.subscribe(timeHandler);
        });

        this.unSubscribeVisibilityChange = this.eventManager.addGlobalEventListener('document', 'visibilitychange', () => {
            if (this.document.hidden) {
                this.timerSubscription.unsubscribe();
            } else {
                this.updateRooms();
                this.ngZone.runOutsideAngular(() => {
                    this.timerObservable.subscribe(timeHandler);
                });
            }
        });
    }

    ngOnDestroy() {
        if (this.timerSubscription && !this.timerSubscription.closed) {
            this.timerSubscription.unsubscribe();
        }
        if (this.unSubscribeVisibilityChange) {
            this.unSubscribeVisibilityChange();
        }
    }

    hasRooms(): boolean {
        return this.rooms && this.rooms.length > 0;
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
            .pipe(map(room => RoomListComponent.mapForecastOrHistory(room, true)))
            .subscribe(
                room => {
                    // set some attributes
                    room.favorite = favorites.indexOf(room.id) !== -1;

                    if (room.favorite) {
                        this.favoriteRooms.push(room);
                    } else {
                        this.rooms.push(room);
                    }

                    this.waitForloading = false;
                },
                error => { console.log(error); },
                () => roomSubscription.unsubscribe()
            );
    }

    private updateRooms() {
        const roomSubscription = this.service.getRooms()
            .pipe(switchMap(rooms => from(rooms)))
            .pipe(map(room => RoomListComponent.mapForecastOrHistory(room, true)))
            .subscribe(
                updatedRoom => {
                    [...this.rooms, ...this.favoriteRooms].forEach(room => {
                        if (room.id === updatedRoom.id) {
                            room.forecast = updatedRoom.forecast;
                            room.status = updatedRoom.status;
                            if (updatedRoom.push) {
                                room.push = updatedRoom.push;
                            }
                        }
                    });
                },
                error => { console.log(error); },
                () => roomSubscription.unsubscribe()
            );
    }
}
