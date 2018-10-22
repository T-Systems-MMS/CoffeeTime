import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
    selector: 'app-frame',
    templateUrl: './frame.component.html',
    styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

    @Input()
    public label: string;

    @Output()
    public back: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }
}
