import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { createTestApp } from './helpers'

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    app = await createTestApp()
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
