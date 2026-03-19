import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { createTestApp } from './helpers'

describe('LocalesController (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  // Locales are seeded once on module init and are immutable reference data.
  // No cleanDatabase between tests — the seeded data is always present.

  describe('GET /locales', () => {
    it('returns paginated response with seeded data', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales').expect(200)

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('page')
      expect(body).toHaveProperty('limit')
      expect(body).toHaveProperty('totalPages')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.total).toBeGreaterThan(0)
      expect(body.data[0]).toHaveProperty('code')
      expect(body.data[0]).toHaveProperty('name')
      expect(body.data[0]).toHaveProperty('nativeName')
      expect(body.data[0]).toHaveProperty('direction')
    })

    it('returns raw array when pagination=false', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?pagination=false').expect(200)

      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
    })

    it('returns only RTL locales when direction=rtl', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?direction=rtl&pagination=false').expect(200)

      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
      expect(body.every((l: { direction: string }) => l.direction === 'rtl')).toBe(true)
    })

    it('returns only LTR locales when direction=ltr', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?direction=ltr&pagination=false').expect(200)

      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
      expect(body.every((l: { direction: string }) => l.direction === 'ltr')).toBe(true)
    })

    it('filters locales by search term', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?search=french&pagination=false').expect(200)

      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
      expect(
        body.every(
          (l: { name: string; nativeName: string; code: string }) =>
            l.name.toLowerCase().includes('french') ||
            l.nativeName.toLowerCase().includes('french') ||
            l.code.toLowerCase().includes('french')
        )
      ).toBe(true)
    })

    it('combines search and direction filters', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/locales?search=french&direction=ltr&pagination=false')
        .expect(200)

      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
      expect(body.every((l: { direction: string }) => l.direction === 'ltr')).toBe(true)
    })

    it('rejects invalid direction value', async () => {
      await request(app.getHttpServer()).get('/locales?direction=invalid').expect(400)
    })
  })

  describe('GET /locales/:code', () => {
    it('returns locale by code', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales/en').expect(200)

      expect(body).toMatchObject({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
      })
    })

    it('returns RTL locale by code', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales/ar').expect(200)

      expect(body).toMatchObject({
        code: 'ar',
        direction: 'rtl',
      })
    })

    it('returns 404 for non-existent locale code', async () => {
      await request(app.getHttpServer()).get('/locales/xx-nonexistent').expect(404)
    })
  })
})
