import { TestBed } from '@angular/core/testing';

import { PushService } from './push.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { HttpClientModule } from '@angular/common/http';

describe('PushService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ServiceWorkerModule.register('', {enabled: false}),
      StorageServiceModule,
      HttpClientModule
    ]

  }));

  it('should be created', () => {
    const service: PushService = TestBed.get(PushService);
    expect(service).toBeTruthy();
  });
});
