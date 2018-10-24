import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-frame',
    templateUrl: './frame.component.html',
    styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

    @Input()
    public loading: boolean;

    @Input()
    public label: string;

    @Output()
    public back: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }
}
