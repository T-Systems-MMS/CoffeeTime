import { TestBed } from '@angular/core/testing';

import { RoomService } from './room.service';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageServiceModule } from 'ngx-webstorage-service';

describe('RoomService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
      ServiceWorkerModule.register('', {enabled: false}),
      StorageServiceModule
    ],
    providers: [
      RoomService
    ]
  }));

  it('should be created', () => {
    const service: RoomService = TestBed.get(RoomService);
    expect(service).toBeTruthy();
  });
});
