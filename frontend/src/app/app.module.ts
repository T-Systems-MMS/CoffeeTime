import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RoomsModule } from './rooms/rooms.module';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { ComponentModule } from '../components/component.module';

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        RoomsModule,
        AppRoutingModule,   // -> after all other modules with routes
        StorageServiceModule,
        ComponentModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
