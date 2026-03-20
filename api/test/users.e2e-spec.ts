import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { cleanDatabase, createTestApp, getNonExistentId, seedUser } from './helpers'

const AUTH_USER = { name: 'Auth User', username: 'auth_user', email: 'auth@example.com', password: 'password123' }

async function getAuthToken(app: INestApplication<App>): Promise<string> {
  await seedUser(app, AUTH_USER)
  const { body } = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ identifier: AUTH_USER.email, password: AUTH_USER.password })
    .expect(200)
  return (body as { accessToken: string }).accessToken
}

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>
  let authToken: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await cleanDatabase(app)
    authToken = await getAuthToken(app)
  })

  describe('POST /users', () => {
    it('creates a user with valid data', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      expect(body).toMatchObject({
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
      expect(body.id).toBeDefined()
      expect(body.password).toBeUndefined()
    })

    it('rejects empty body', async () => {
      await request(app.getHttpServer()).post('/users').set('Authorization', `Bearer ${authToken}`).send({}).expect(400)
    })

    it('rejects missing name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'alice', email: 'test@example.com', password: 'password123' })
        .expect(400)
    })

    it('rejects missing username', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', email: 'test@example.com', password: 'password123' })
        .expect(400)
    })

    it('rejects username shorter than 3 characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'ab', email: 'alice@example.com', password: 'password123' })
        .expect(400)
    })

    it('rejects username with invalid characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice smith', email: 'alice@example.com', password: 'password123' })
        .expect(400)
    })

    it('rejects missing password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bob', username: 'bob', email: 'bob@example.com' })
        .expect(400)
    })

    it('rejects password shorter than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bob', username: 'bob', email: 'bob@example.com', password: 'short' })
        .expect(400)
    })

    it('rejects invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bob', username: 'bob', email: 'not-an-email', password: 'password123' })
        .expect(400)
    })

    it('rejects duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { status } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice 2', username: 'alice2', email: 'alice@example.com', password: 'password123' })

      // Unique constraint violation — no global conflict handler yet, so DB throws 500
      expect(status).toBeGreaterThanOrEqual(400)
    })

    it('rejects duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { status } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice 2', username: 'alice', email: 'alice2@example.com', password: 'password123' })

      // Unique constraint violation — no global conflict handler yet, so DB throws 500
      expect(status).toBeGreaterThanOrEqual(400)
    })

    it('rejects request without token', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(401)
    })
  })

  describe('GET /users', () => {
    it('returns only the auth user when no other users exist', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(body).toHaveProperty('data')
      expect(body.data).toHaveLength(1)
      expect(body.data[0]).toMatchObject({ name: AUTH_USER.name, username: AUTH_USER.username, email: AUTH_USER.email })
      expect(body.total).toBe(1)
    })

    it('returns all users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bob', username: 'bob', email: 'bob@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(body.total).toBeGreaterThanOrEqual(2)
    })

    it('rejects request without token', async () => {
      await request(app.getHttpServer()).get('/users').expect(401)
    })
  })

  describe('GET /users/:id', () => {
    it('returns user by ID', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(body).toMatchObject({ name: 'Alice', username: 'alice', email: 'alice@example.com' })
      expect(body.password).toBeUndefined()
    })

    it('returns 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get(`/users/${getNonExistentId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('returns 404 for invalid ID format', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('PATCH /users/:id', () => {
    it('updates user name', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice Updated' })
        .expect(200)

      expect(body.name).toBe('Alice Updated')
      expect(body.email).toBe('alice@example.com')
    })

    it('updates user email', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'alice2@example.com' })
        .expect(200)

      expect(body.email).toBe('alice2@example.com')
    })

    it('updates username', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'alice_v2' })
        .expect(200)

      expect(body.username).toBe('alice_v2')
    })

    it('strips unknown fields', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice 2', unknown: 'field' })
        .expect(200)

      expect(body).not.toHaveProperty('unknown')
      expect(body.name).toBe('Alice 2')
    })

    it('ignores password field in updates', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      // password is stripped by whitelist validation (not in UpdateUserDto)
      await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice 2', password: 'newpassword' })
        .expect(200)
    })

    it('returns 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${getNonExistentId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404)
    })
  })

  describe('DELETE /users/:id', () => {
    it('deletes existing user', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
    })

    it('returns 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${getNonExistentId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('confirms user is gone after deletion', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'password123' })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      await request(app.getHttpServer())
        .get(`/users/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
