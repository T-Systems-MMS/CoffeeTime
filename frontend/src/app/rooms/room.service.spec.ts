import { TestBed } from '@angular/core/testing';

import { RoomService } from './room.service';
import { HttpClientModule } from '@angular/common/http';

describe('DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule
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
