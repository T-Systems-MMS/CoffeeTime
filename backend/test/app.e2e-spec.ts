import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ApiController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ich glaub die json response ist zu lang .. hier muss ein mock oder gescheite testdaten her
  xit('/ (GET)', (done) => {
    return request(app.getHttpServer())
      .get('/api/rooms')
      .expect(200, done)
      .end((err, res) => {
        if (err) throw err;
      });
  });
});
