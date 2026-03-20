import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { cleanDatabase, createTestApp, seedUser } from './helpers'

const TEST_USER = { name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' }

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await cleanDatabase(app)
  })

  describe('POST /auth/login', () => {
    it('returns tokens when logging in with email', async () => {
      await seedUser(app, TEST_USER)

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
    })

    it('returns tokens when logging in with username', async () => {
      await seedUser(app, TEST_USER)

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.username, password: TEST_USER.password })
        .expect(200)

      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
    })

    it('returns tokens when logging in with username in different case', async () => {
      await seedUser(app, TEST_USER)

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.username.toUpperCase(), password: TEST_USER.password })
        .expect(200)

      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
    })

    it('rejects wrong password', async () => {
      await seedUser(app, TEST_USER)

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: 'wrongpassword' })
        .expect(401)
    })

    it('rejects unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'nobody@example.com', password: 'password123' })
        .expect(401)
    })

    it('rejects unknown username', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'ghost', password: 'password123' })
        .expect(401)
    })

    it('rejects missing fields', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({}).expect(400)
    })

    it('does not return password in login response', async () => {
      await seedUser(app, TEST_USER)

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      expect(body.password).toBeUndefined()
    })
  })

  describe('POST /auth/refresh', () => {
    it('returns new tokens with a valid refresh token', async () => {
      await seedUser(app, TEST_USER)

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      const { body } = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${loginBody.refreshToken}`)
        .expect(200)

      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
    })

    it('rejects an access token used as a refresh token', async () => {
      await seedUser(app, TEST_USER)

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${loginBody.accessToken}`)
        .expect(401)
    })

    it('rejects an invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer not-a-valid-token')
        .expect(401)
    })
  })

  describe('protected routes', () => {
    it('rejects GET /users without a token', async () => {
      await request(app.getHttpServer()).get('/users').expect(401)
    })

    it('allows GET /users with a valid access token', async () => {
      await seedUser(app, TEST_USER)

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${loginBody.accessToken}`)
        .expect(200)
    })
  })
})
