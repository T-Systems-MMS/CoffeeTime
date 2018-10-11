import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { SwPush } from '@angular/service-worker';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { viewParentEl } from '@angular/core/src/view/util';
import { PushService } from '../push.service';
import { RoomService } from '../room.service';
import { Router } from '@angular/router';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { verticalLinePlugin } from '../../../components/verticalline.plugin';
import { thresholdPlugin } from '../../../components/threshold.plugin';

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
                { x: new Date('12.27.2017 12:30'), y: 20 },
                { x: new Date('12.27.2017 12:31'), y: 95 },
                { x: new Date('12.27.2017 12:32'), y: 80 },
                { x: new Date('12.27.2017 12:33'), y: 30 },
                { x: new Date('12.27.2017 12:34'), y: 10 },
                { x: new Date('12.27.2017 12:41'), y: 30 },
                { x: new Date('12.27.2017 12:43'), y: 30 },
                { x: new Date('12.27.2017 12:43'), y: 20 },
                { x: new Date('12.27.2017 12:54'), y: 20 },
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
            verticalLinePlugin({ label: 'jetzt', position: new Date('12.27.2017 12:37'), className: 'ct-now' })
        ]
    };
    responsiveOptions = [];

    @Input() room;

  constructor(
    private service: RoomService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) { }

    ngOnInit() {

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
