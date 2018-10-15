import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [RoomService],
    }).compile();
  });

  describe('api', () => {
    xit('should return "two Empty Rooms"', () => {
      const apiController = app.get<ApiController>(ApiController);
      const rooms = apiController.rooms([]);
      delete rooms[0].forecast;
      delete rooms[1].forecast;

      const expectedRooms = [new Room('123'), new Room('456')];
      delete expectedRooms[0].forecast;
      delete expectedRooms[1].forecast;
      expect(rooms).toEqual(expectedRooms);
    });
  });
});
