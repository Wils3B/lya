import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/healthcheck (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthcheck')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
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
      })
  })
})
