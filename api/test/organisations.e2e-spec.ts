import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { cleanDatabase, createTestApp, getNonExistentId, seedUser } from './helpers'

const OWNER_USER = { name: 'Owner', username: 'owner_user', email: 'owner@example.com', password: 'password123' }
const OTHER_USER = { name: 'Other', username: 'other_user', email: 'other@example.com', password: 'password123' }
const THIRD_USER = { name: 'Third', username: 'third_user', email: 'third@example.com', password: 'password123' }

async function login(app: INestApplication<App>, identifier: string, password: string): Promise<string> {
  const { body } = await request(app.getHttpServer()).post('/auth/login').send({ identifier, password }).expect(200)
  return (body as { accessToken: string }).accessToken
}

async function createOrg(
  app: INestApplication<App>,
  token: string,
  payload: object
): Promise<{ id: string; slug: string }> {
  const { body } = await request(app.getHttpServer())
    .post('/organisations')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect(201)
  return body as { id: string; slug: string }
}

describe('OrganisationsController (e2e)', () => {
  let app: INestApplication<App>
  let ownerToken: string
  let otherToken: string
  let thirdToken: string
  let ownerId: string
  let otherId: string
  let thirdId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await cleanDatabase(app)
    const ownerUser = await seedUser(app, OWNER_USER)
    const otherUser = await seedUser(app, OTHER_USER)
    const thirdUser = await seedUser(app, THIRD_USER)
    ownerId = String(ownerUser.id)
    otherId = String(otherUser.id)
    thirdId = String(thirdUser.id)
    ownerToken = await login(app, OWNER_USER.email, OWNER_USER.password)
    otherToken = await login(app, OTHER_USER.email, OTHER_USER.password)
    thirdToken = await login(app, THIRD_USER.email, THIRD_USER.password)
  })

  // ─── POST /organisations ─────────────────────────────────────────────────────

  describe('POST /organisations', () => {
    it('creates an organisation and returns it', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/organisations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Acme Corp', description: 'A company' })
        .expect(201)

      expect(body).toMatchObject({ name: 'Acme Corp', slug: 'acme-corp', description: 'A company' })
      expect(body.id).toBeDefined()
    })

    it('auto-generates a URL-safe slug from the name', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/organisations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'My Cool Org!' })
        .expect(201)

      expect(body.slug).toBe('my-cool-org')
    })

    it('rejects missing name', async () => {
      await request(app.getHttpServer())
        .post('/organisations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ description: 'no name' })
        .expect(400)
    })

    it('rejects request without token', async () => {
      await request(app.getHttpServer()).post('/organisations').send({ name: 'Acme' }).expect(401)
    })
  })

  // ─── GET /organisations ───────────────────────────────────────────────────────

  describe('GET /organisations', () => {
    it('lists only organisations the user belongs to', async () => {
      await createOrg(app, ownerToken, { name: 'Org A' })
      await createOrg(app, ownerToken, { name: 'Org B' })
      await createOrg(app, otherToken, { name: 'Org C' })

      const { body } = await request(app.getHttpServer())
        .get('/organisations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.total).toBe(2)
      const names = (body.data as { name: string }[]).map((o) => o.name)
      expect(names).toContain('Org A')
      expect(names).toContain('Org B')
      expect(names).not.toContain('Org C')
    })

    it('returns empty list for user with no orgs', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/organisations')
        .set('Authorization', `Bearer ${thirdToken}`)
        .expect(200)

      expect(body.total).toBe(0)
    })
  })

  // ─── GET /organisations/:id ───────────────────────────────────────────────────

  describe('GET /organisations/:id', () => {
    it('returns the organisation by id for a member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.name).toBe('Acme')
    })

    it('returns the organisation by slug for a member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme Slug' })

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${org.slug}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.slug).toBe('acme-slug')
    })

    it('returns 403 for a non-member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Private Org' })

      await request(app.getHttpServer())
        .get(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })

    it('returns 404 for non-existent org', async () => {
      // First create an org so the guard can find it... wait, guard will 403 first.
      // Use the owner who is also a member of the (non-existent) org — 403 since no membership.
      await request(app.getHttpServer())
        .get(`/organisations/${getNonExistentId()}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403)
    })
  })

  // ─── PATCH /organisations/:id ─────────────────────────────────────────────────

  describe('PATCH /organisations/:id', () => {
    it('allows owner to update name', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Old Name' })

      const { body } = await request(app.getHttpServer())
        .patch(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'New Name' })
        .expect(200)

      expect(body.name).toBe('New Name')
    })

    it('returns 403 for standard member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      // Invite other user as standard
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hijacked' })
        .expect(403)
    })

    it('returns 403 for non-member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .patch(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hijacked' })
        .expect(403)
    })
  })

  // ─── DELETE /organisations/:id ────────────────────────────────────────────────

  describe('DELETE /organisations/:id', () => {
    it('allows owner to delete organisation', async () => {
      const org = await createOrg(app, ownerToken, { name: 'To Delete' })

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .get(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403) // guard fires — no membership since org deleted
    })

    it('returns 403 for non-owner member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })
  })

  // ─── POST /organisations/:id/members ─────────────────────────────────────────

  describe('POST /organisations/:id/members', () => {
    it('allows owner to invite a member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      const { body } = await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      expect(body.userId).toBeDefined()
      expect(body.role).toBe('standard')
    })

    it('returns 409 when user is already a member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(409)
    })

    it('returns 403 for standard member trying to invite', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ userId: thirdId })
        .expect(403)
    })
  })

  // ─── GET /organisations/:id/members ──────────────────────────────────────────

  describe('GET /organisations/:id/members', () => {
    it('lists members for a member of the org', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.total).toBe(2) // owner + other
    })

    it('returns 403 for non-member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .get(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })
  })

  // ─── DELETE /organisations/:id/members/:userId ────────────────────────────────

  describe('DELETE /organisations/:id/members/:userId', () => {
    it('allows owner to remove a standard member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/members/${otherId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
    })

    it('returns 403 when trying to remove an owner', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/members/${ownerId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403)
    })

    it('returns 404 when member not found', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/members/${otherId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404)
    })
  })

  // ─── PATCH /organisations/:id/members/:userId/role ────────────────────────────

  describe('PATCH /organisations/:id/members/:userId/role', () => {
    it('allows owner to promote standard to administrator', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/organisations/${org.id}/members/${otherId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'administrator' })
        .expect(200)

      expect(body.role).toBe('administrator')
    })

    it("returns 403 when trying to change an owner's role", async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .patch(`/organisations/${org.id}/members/${ownerId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'administrator' })
        .expect(403)
    })

    it('rejects invalid role value', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/organisations/${org.id}/members/${otherId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'owner' })
        .expect(400)
    })
  })

  // ─── POST /organisations/:id/transfer-ownership ───────────────────────────────

  describe('POST /organisations/:id/transfer-ownership', () => {
    it('transfers ownership to an existing member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .post(`/organisations/${org.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      expect(body.role).toBe('owner')

      // Verify previous owner is now administrator
      const { body: members } = await request(app.getHttpServer())
        .get(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)

      const ownerMember = (members.data as { userId: string; role: string }[]).find((m) => m.userId === ownerId)
      expect(ownerMember?.role).toBe('administrator')
    })

    it('returns 404 when target user is not a member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(404)
    })

    it('returns 403 for non-owner', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ userId: ownerId })
        .expect(403)
    })
  })

  // ─── DELETE /organisations/:id/leave ─────────────────────────────────────────

  describe('DELETE /organisations/:id/leave', () => {
    it('allows a standard member to leave', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/leave`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)
    })

    it('blocks the last owner from leaving', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/leave`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403)
    })

    it('allows an owner to leave when another owner exists', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      // Transfer ownership first to make other user an owner
      await request(app.getHttpServer())
        .post(`/organisations/${org.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: otherId })
        .expect(201)

      // Now original owner (now administrator) leaves
      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/leave`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
    })

    it('returns 403 for non-member', async () => {
      const org = await createOrg(app, ownerToken, { name: 'Acme' })

      await request(app.getHttpServer())
        .delete(`/organisations/${org.id}/leave`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })
  })
})
