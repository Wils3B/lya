import { HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'

const mockHealthCheckService = {
  check: jest.fn(),
}

const mockDbHealthIndicator = {
  pingCheck: jest.fn(),
}

const mockMemoryHealthIndicator = {
  checkHeap: jest.fn(),
  checkRSS: jest.fn(),
}

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDbHealthIndicator },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
      ],
    }).compile()

    appController = module.get(AppController)
  })

  describe('healthcheck', () => {
    it('should return the terminus health status', async () => {
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          memory_heap: {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          memory_heap: {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
        },
      })

      await expect(appController.healthcheck()).resolves.toMatchObject({
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          memory_heap: {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
        },
      })

      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1)
    })
  })
})
