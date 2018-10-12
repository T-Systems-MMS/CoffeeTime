import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../room.service';
import { Interpolation, FixedScaleAxis } from 'chartist';
import { thresholdPlugin } from '../../../components/threshold.plugin';

@Component({
    selector: 'app-room-detail',
    templateUrl: './room-detail.component.html',
    styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
    room;

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
        ]
    };
    responsiveOptions = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: RoomService
  ) {
    this.room = {};
   }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.service.getRoom(id).subscribe((response) => {
      this.room = response;
    });
  }

    gotoRooms() {
        this.router.navigate(['/rooms']);
    }
}
