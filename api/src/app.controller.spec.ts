import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('healthcheck', () => {
    it('should return the health status', () => {
      const appController = app.get(AppController);
      expect(appController.healthcheck()).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
      });
    });
  });
});
