import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Room } from './domain/room';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('api', () => {
    it('should return "two Empty Rooms"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.api([])).toEqual([new Room('123'), new Room('456')]);
    });
  });
});
