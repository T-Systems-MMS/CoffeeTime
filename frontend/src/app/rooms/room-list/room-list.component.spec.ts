import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomListComponent } from './room-list.component';
import { RoomComponent } from '../room/room.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoomService } from '../room.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { ComponentModule } from '../../../components/component.module';

describe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomListComponent,
        RoomComponent
      ],
      imports: [
        HttpClientModule,
        MatToolbarModule,
        MatIconModule,
        MatExpansionModule,
        MatCardModule,
        MatSlideToggleModule,
        MatButtonModule,
        BrowserAnimationsModule,
        ServiceWorkerModule.register('', {enabled: false}),
        StorageServiceModule,
        ComponentModule
      ],
      providers: [
        RoomService
      ],
    })
      .compileComponents();
  }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RoomListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
