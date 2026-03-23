import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { cleanDatabase, createTestApp, getNonExistentId, login, seedUser } from './helpers'

const OWNER_USER = { name: 'Owner', username: 'proj_owner', email: 'proj_owner@example.com', password: 'password123' }
const MEMBER_USER = {
  name: 'Member',
  username: 'proj_member',
  email: 'proj_member@example.com',
  password: 'password123',
}
const OUTSIDER_USER = {
  name: 'Outsider',
  username: 'proj_outsider',
  email: 'proj_outsider@example.com',
  password: 'password123',
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

async function createProject(
  app: INestApplication<App>,
  token: string,
  orgId: string,
  payload: object
): Promise<{ id: string; slug: string }> {
  const { body } = await request(app.getHttpServer())
    .post(`/organisations/${orgId}/projects`)
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect(201)
  return body as { id: string; slug: string }
}

describe('ProjectsController (e2e)', () => {
  let app: INestApplication<App>
  let ownerToken: string
  let memberToken: string
  let outsiderToken: string
  let memberId: string
  let orgId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await cleanDatabase(app)

    await seedUser(app, OWNER_USER)
    const memberUser = await seedUser(app, MEMBER_USER)
    await seedUser(app, OUTSIDER_USER)

    memberId = String(memberUser.id)

    ownerToken = await login(app, OWNER_USER.email, OWNER_USER.password)
    memberToken = await login(app, MEMBER_USER.email, MEMBER_USER.password)
    outsiderToken = await login(app, OUTSIDER_USER.email, OUTSIDER_USER.password)

    // Owner creates an org and invites member as standard
    const org = await createOrg(app, ownerToken, { name: 'Test Org', slug: 'test-org' })
    orgId = org.id

    await request(app.getHttpServer())
      .post(`/organisations/${orgId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ userId: memberId })
      .expect(201)
  })

  // ─── POST /organisations/:orgId/projects ─────────────────────────────────────

  describe('POST /organisations/:orgId/projects', () => {
    it('allows org owner to create a project and become maintainer', async () => {
      const { body } = await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'My App', slug: 'my-app', description: 'A cool app' })
        .expect(201)

      expect(body).toMatchObject({ name: 'My App', slug: 'my-app', description: 'A cool app' })
      expect(body.id).toBeDefined()
    })

    it('rejects duplicate slug within same org', async () => {
      await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Another App', slug: 'my-app' })
        .expect(409)
    })

    it('allows same slug in different orgs', async () => {
      await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      const otherOrg = await createOrg(app, ownerToken, { name: 'Other Org', slug: 'other-org' })
      await request(app.getHttpServer())
        .post(`/organisations/${otherOrg.id}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'My App', slug: 'my-app' })
        .expect(201)
    })

    it('rejects missing name', async () => {
      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ slug: 'my-app' })
        .expect(400)
    })

    it('rejects invalid slug format', async () => {
      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'My App', slug: 'My App!' })
        .expect(400)
    })

    it('returns 403 for outsider (not org member)', async () => {
      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ name: 'My App', slug: 'my-app' })
        .expect(403)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects`)
        .send({ name: 'My App', slug: 'my-app' })
        .expect(401)
    })
  })

  // ─── GET /organisations/:orgId/projects ──────────────────────────────────────

  describe('GET /organisations/:orgId/projects', () => {
    it('org admin sees all projects', async () => {
      await createProject(app, ownerToken, orgId, { name: 'App A', slug: 'app-a' })
      await createProject(app, ownerToken, orgId, { name: 'App B', slug: 'app-b' })

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.total).toBe(2)
    })

    it('standard org member sees only their projects', async () => {
      await createProject(app, ownerToken, orgId, { name: 'App A', slug: 'app-a' })
      const memberProject = await createProject(app, memberToken, orgId, { name: 'App B', slug: 'app-b' })

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)

      // member created App B so they're a maintainer there; App A was created by owner only
      expect(body.total).toBe(1)
      expect(body.data[0].id).toBe(memberProject.id)
    })

    it('returns 403 for outsider', async () => {
      await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403)
    })
  })

  // ─── GET /organisations/:orgId/projects/:projectId ───────────────────────────

  describe('GET /organisations/:orgId/projects/:projectId', () => {
    it('returns project for org admin', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.name).toBe('My App')
    })

    it('returns 403 for standard member without explicit project access', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403)
    })

    it('returns project for standard member who is an explicit project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)

      expect(body.id).toBe(project.id)
    })

    it('returns 404 for non-existent project id (to org admin)', async () => {
      await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${getNonExistentId()}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404)
    })
  })

  // ─── PATCH /organisations/:orgId/projects/:projectId ─────────────────────────

  describe('PATCH /organisations/:orgId/projects/:projectId', () => {
    it('allows org admin to update project', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'Old Name', slug: 'old-name' })

      const { body } = await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'New Name' })
        .expect(200)

      expect(body.name).toBe('New Name')
    })

    it('allows project maintainer to update project', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'Old Name', slug: 'old-name' })

      // Invite member as maintainer
      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId, role: 'maintainer' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Updated Name' })
        .expect(200)

      expect(body.name).toBe('Updated Name')
    })

    it('returns 403 for project contributor', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId, role: 'contributor' })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Hacked' })
        .expect(403)
    })
  })

  // ─── DELETE /organisations/:orgId/projects/:projectId ────────────────────────

  describe('DELETE /organisations/:orgId/projects/:projectId', () => {
    it('allows org admin to delete project', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
    })

    it('returns 403 for standard org member even if project maintainer', async () => {
      const project = await createProject(app, memberToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403)
    })
  })

  // ─── POST /organisations/:orgId/projects/:projectId/locales ──────────────────

  describe('POST /organisations/:orgId/projects/:projectId/locales', () => {
    it('allows org admin to add a locale', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      const { body } = await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'en' })
        .expect(201)

      expect(body.localeCode).toBe('en')
    })

    it('returns 404 for unsupported locale code', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'xx-FAKE' })
        .expect(404)
    })

    it('returns 409 when locale already added', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'en' })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'en' })
        .expect(409)
    })
  })

  // ─── GET /organisations/:orgId/projects/:projectId/locales ───────────────────

  describe('GET /organisations/:orgId/projects/:projectId/locales', () => {
    it('lists locales for a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'en' })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'fr' })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      expect(body.total).toBe(2)
    })
  })

  // ─── DELETE /organisations/:orgId/projects/:projectId/locales/:code ──────────

  describe('DELETE /organisations/:orgId/projects/:projectId/locales/:localeCode', () => {
    it('removes a locale from the project', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/locales`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ localeCode: 'en' })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}/locales/en`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
    })

    it('returns 404 when locale not on project', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}/locales/fr`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404)
    })
  })

  // ─── POST /organisations/:orgId/projects/:projectId/members ──────────────────

  describe('POST /organisations/:orgId/projects/:projectId/members', () => {
    it('allows org admin to add a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      const { body } = await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      expect(body.userId).toBeDefined()
      expect(body.role).toBe('contributor')
    })

    it('returns 409 when user is already a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(409)
    })
  })

  // ─── GET /organisations/:orgId/projects/:projectId/members ───────────────────

  describe('GET /organisations/:orgId/projects/:projectId/members', () => {
    it('lists members for org admin', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .get(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)

      // owner (auto-added as maintainer at creation) + member
      expect(body.total).toBe(2)
    })
  })

  // ─── DELETE /organisations/:orgId/projects/:projectId/members/:userId ─────────

  describe('DELETE /organisations/:orgId/projects/:projectId/members/:userId', () => {
    it('removes a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}/members/${memberId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200)
    })

    it('returns 404 when user is not a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .delete(`/organisations/${orgId}/projects/${project.id}/members/${memberId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404)
    })
  })

  // ─── PATCH /organisations/:orgId/projects/:projectId/members/:userId/role ─────

  describe('PATCH /organisations/:orgId/projects/:projectId/members/:userId/role', () => {
    it('updates a project member role', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      const { body } = await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'maintainer' })
        .expect(200)

      expect(body.role).toBe('maintainer')
    })

    it('rejects invalid role value', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .post(`/organisations/${orgId}/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberId })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'owner' })
        .expect(400)
    })

    it('returns 404 when user is not a project member', async () => {
      const project = await createProject(app, ownerToken, orgId, { name: 'My App', slug: 'my-app' })

      await request(app.getHttpServer())
        .patch(`/organisations/${orgId}/projects/${project.id}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'maintainer' })
        .expect(404)
    })
  })
})
