import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';
import localDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [slideInAnimation]
})

export class AppComponent implements OnInit {

    constructor() {
        registerLocaleData(localDe, 'de');
    }

    ngOnInit() { }

    getAnimationData(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }
}
