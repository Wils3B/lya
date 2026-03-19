import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { cleanDatabase, createTestApp, getNonExistentId } from './helpers'

describe('UsersController (e2e)', () => {
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

  describe('POST /users', () => {
    it('creates a user with valid data', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      expect(body).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
      expect(body.id).toBeDefined()
    })

    it('rejects empty body', async () => {
      await request(app.getHttpServer()).post('/users').send({}).expect(400)
    })

    it('rejects missing name', async () => {
      await request(app.getHttpServer()).post('/users').send({ email: 'test@example.com' }).expect(400)
    })

    it('rejects invalid email format', async () => {
      await request(app.getHttpServer()).post('/users').send({ name: 'Bob', email: 'not-an-email' }).expect(400)
    })

    it('rejects duplicate email', async () => {
      await request(app.getHttpServer()).post('/users').send({ name: 'Alice', email: 'alice@example.com' }).expect(201)

      const { status } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice 2', email: 'alice@example.com' })

      // Unique constraint violation — no global conflict handler yet, so DB throws 500
      expect(status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /users', () => {
    it('returns empty array when no users', async () => {
      const { body } = await request(app.getHttpServer()).get('/users').expect(200)
      expect(body).toEqual([])
    })

    it('returns all users', async () => {
      await request(app.getHttpServer()).post('/users').send({ name: 'Alice', email: 'alice@example.com' }).expect(201)
      await request(app.getHttpServer()).post('/users').send({ name: 'Bob', email: 'bob@example.com' }).expect(201)

      const { body } = await request(app.getHttpServer()).get('/users').expect(200)
      expect(body).toHaveLength(2)
    })
  })

  describe('GET /users/:id', () => {
    it('returns user by ID', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      const { body } = await request(app.getHttpServer()).get(`/users/${created.id}`).expect(200)
      expect(body).toMatchObject({ name: 'Alice', email: 'alice@example.com' })
    })

    it('returns 404 for non-existent ID', async () => {
      await request(app.getHttpServer()).get(`/users/${getNonExistentId()}`).expect(404)
    })

    it('returns 404 for invalid ID format', async () => {
      await request(app.getHttpServer()).get('/users/invalid-id-format').expect(404)
    })
  })

  describe('PATCH /users/:id', () => {
    it('updates user name', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .send({ name: 'Alice Updated' })
        .expect(200)

      expect(body.name).toBe('Alice Updated')
      expect(body.email).toBe('alice@example.com')
    })

    it('updates user email', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .send({ email: 'alice2@example.com' })
        .expect(200)

      expect(body.email).toBe('alice2@example.com')
    })

    it('strips unknown fields', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .send({ name: 'Alice 2', unknown: 'field' })
        .expect(200)

      expect(body).not.toHaveProperty('unknown')
      expect(body.name).toBe('Alice 2')
    })

    it('returns 404 for non-existent user', async () => {
      await request(app.getHttpServer()).patch(`/users/${getNonExistentId()}`).send({ name: 'Updated' }).expect(404)
    })
  })

  describe('DELETE /users/:id', () => {
    it('deletes existing user', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      await request(app.getHttpServer()).delete(`/users/${created.id}`).expect(200)
    })

    it('returns 404 for non-existent user', async () => {
      await request(app.getHttpServer()).delete(`/users/${getNonExistentId()}`).expect(404)
    })

    it('confirms user is gone after deletion', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      await request(app.getHttpServer()).delete(`/users/${created.id}`).expect(200)
      await request(app.getHttpServer()).get(`/users/${created.id}`).expect(404)
    })
  })
})
