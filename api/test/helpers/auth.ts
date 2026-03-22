import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'

export async function login(app: INestApplication<App>, identifier: string, password: string): Promise<string> {
  const { body } = await request(app.getHttpServer()).post('/auth/login').send({ identifier, password }).expect(200)
  return (body as { accessToken: string }).accessToken
}
