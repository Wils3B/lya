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

  describe('GET /locales', () => {
    it('returns paginated locales without any filter', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales').expect(200)

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('page', 1)
      expect(body).toHaveProperty('limit', 20)
      expect(body).toHaveProperty('totalPages')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.total).toBeGreaterThan(0)
    })

    it('returns locales with expected shape', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales').expect(200)

      const locale = body.data[0]
      expect(locale).toHaveProperty('id')
      expect(locale).toHaveProperty('code')
      expect(locale).toHaveProperty('name')
      expect(locale).toHaveProperty('nativeName')
      expect(locale).toHaveProperty('direction')
      expect(['ltr', 'rtl']).toContain(locale.direction)
    })

    it('is publicly accessible without authentication', async () => {
      await request(app.getHttpServer()).get('/locales').expect(200)
    })

    it('respects pagination — page and limit params', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?page=1&limit=5').expect(200)

      expect(body.page).toBe(1)
      expect(body.limit).toBe(5)
      expect(body.data.length).toBeLessThanOrEqual(5)
    })

    it('returns second page with different results', async () => {
      const { body: page1 } = await request(app.getHttpServer()).get('/locales?page=1&limit=5').expect(200)
      const { body: page2 } = await request(app.getHttpServer()).get('/locales?page=2&limit=5').expect(200)

      const page1Codes: string[] = page1.data.map((l: { code: string }) => l.code)
      const page2Codes: string[] = page2.data.map((l: { code: string }) => l.code)
      const overlap = page1Codes.filter((c: string) => page2Codes.includes(c))
      expect(overlap).toHaveLength(0)
    })

    it('rejects invalid page param', async () => {
      await request(app.getHttpServer()).get('/locales?page=0').expect(400)
    })

    it('rejects invalid limit param', async () => {
      await request(app.getHttpServer()).get('/locales?limit=0').expect(400)
    })

    it('rejects limit exceeding max', async () => {
      await request(app.getHttpServer()).get('/locales?limit=101').expect(400)
    })

    it('filters by direction=rtl', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?direction=rtl').expect(200)

      expect(body.data.length).toBeGreaterThan(0)
      for (const locale of body.data as Array<{ direction: string }>) {
        expect(locale.direction).toBe('rtl')
      }
    })

    it('filters by direction=ltr', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?direction=ltr').expect(200)

      expect(body.data.length).toBeGreaterThan(0)
      for (const locale of body.data as Array<{ direction: string }>) {
        expect(locale.direction).toBe('ltr')
      }
    })

    it('rejects invalid direction value', async () => {
      await request(app.getHttpServer()).get('/locales?direction=invalid').expect(400)
    })

    it('filters by search term that only matches a code', async () => {
      // 'en-AU' appears in the code but not in the name ('English (Australia)')
      const { body } = await request(app.getHttpServer()).get('/locales?search=en-AU').expect(200)

      expect(body.data.length).toBeGreaterThan(0)
      const match = (body.data as Array<{ code: string; name: string }>).find((l) => l.code === 'en-AU')
      expect(match).toBeDefined()
      expect((match as { code: string; name: string }).name.toLowerCase()).not.toContain('en-au')
    })

    it('filters by search term that only matches a name', async () => {
      // 'French' appears in locale names but not in any BCP 47 code (fr, fr-FR, fr-BE…)
      const { body } = await request(app.getHttpServer()).get('/locales?search=French').expect(200)

      expect(body.data.length).toBeGreaterThan(0)
      for (const locale of body.data as Array<{ code: string; name: string }>) {
        expect(locale.name.toLowerCase()).toContain('french')
        expect(locale.code.toLowerCase()).not.toContain('french')
      }
    })

    it('returns empty data for search with no matches', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?search=zzznomatch').expect(200)

      expect(body.data).toHaveLength(0)
      expect(body.total).toBe(0)
    })

    it('combines direction and search filters', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales?direction=rtl&search=ar').expect(200)

      expect(body.data.length).toBeGreaterThan(0)
      for (const locale of body.data as Array<{ direction: string; code: string; name: string }>) {
        expect(locale.direction).toBe('rtl')
        const matchesSearch = locale.code.toLowerCase().includes('ar') || locale.name.toLowerCase().includes('ar')
        expect(matchesSearch).toBe(true)
      }
    })

    it('rejects search term exceeding max length', async () => {
      const longSearch = 'a'.repeat(101)
      await request(app.getHttpServer()).get(`/locales?search=${longSearch}`).expect(400)
    })
  })

  describe('GET /locales/:code', () => {
    it('returns a locale by BCP 47 code', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales/en').expect(200)

      expect(body).toMatchObject({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
      })
      expect(body.id).toBeDefined()
    })

    it('is publicly accessible without authentication', async () => {
      await request(app.getHttpServer()).get('/locales/en').expect(200)
    })

    it('returns an RTL locale correctly', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales/ar').expect(200)

      expect(body.direction).toBe('rtl')
      expect(body.code).toBe('ar')
    })

    it('returns 404 for non-existent code', async () => {
      await request(app.getHttpServer()).get('/locales/xx-NOPE').expect(404)
    })

    it('returns 404 for empty-looking code', async () => {
      await request(app.getHttpServer()).get('/locales/zzz').expect(404)
    })

    it('returns a region-specific locale (fr-BE)', async () => {
      const { body } = await request(app.getHttpServer()).get('/locales/fr-BE').expect(200)

      expect(body.code).toBe('fr-BE')
      expect(body.direction).toBe('ltr')
    })
  })
})
