import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailComponent } from './room-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RoomService } from '../room.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { ComponentModule } from '../../../components/component.module';
import { MatDividerModule } from '@angular/material/divider';

describe('RoomDetailComponent', () => {
    let component: RoomDetailComponent;
    let fixture: ComponentFixture<RoomDetailComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                RouterTestingModule,
                MatIconModule,
                MatToolbarModule,
                ServiceWorkerModule.register('', { enabled: false }),
                StorageServiceModule,
                ComponentModule,
                MatDividerModule
            ],
            declarations: [RoomDetailComponent],
            providers: [
                RoomService
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RoomDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
