import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';
import localDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { SwPush, SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [slideInAnimation]
})

export class AppComponent implements OnInit {

    constructor(
        private swPush: SwPush,
        private swUpdate: SwUpdate
    ) {
        registerLocaleData(localDe, 'de');
    }

    ngOnInit() {
        this.swUpdate.available.subscribe(() => {
            this.swUpdate.activateUpdate()
                .then(() => {
                    window.location.reload();
                    console.log('Update available and has been activated!');
                })
                .catch(err => {
                    console.log(err);
                });
        });
        this.swPush.messages.subscribe(message => {
            console.log(message);
        });
    }

    getAnimationData(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }
}
