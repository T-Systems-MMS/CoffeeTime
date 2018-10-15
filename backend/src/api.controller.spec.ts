import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { Room } from './domain/room';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [RoomService],
    }).compile();
  });

  xdescribe('api', () => {
    it('should return "two Empty Rooms"', () => {
      const apiController = app.get<ApiController>(ApiController);
      expect(apiController.rooms([])).toEqual([new Room('123'), new Room('456')]);
    });
  });
});
