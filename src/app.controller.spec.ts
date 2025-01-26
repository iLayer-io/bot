import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Ok"', () => {
      const appController = app.get(AppController);
      expect(appController.getHealth()).toBe('ok');
    });
  });
});
