import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomComponent } from './room.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { ComponentModule } from '../../../components/component.module';
import { MatDividerModule } from '@angular/material/divider';
import { Room } from '../room';

describe('RoomComponent', () => {
    let component: RoomComponent;
    let fixture: ComponentFixture<RoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomComponent
      ],
      imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,
        HttpClientModule,
        RouterTestingModule,
        ServiceWorkerModule.register('', {enabled: false}),
        StorageServiceModule,
                ComponentModule,
                MatDividerModule
      ]
    })
      .compileComponents();
  }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RoomComponent);
        component = fixture.componentInstance;
        component.room = new Room('foobar');
        component.room.forecast = [];

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
