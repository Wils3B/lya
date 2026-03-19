import { INestApplication } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { User } from '../../src/users/entities/user.entity'

export interface SeedUserData {
  name: string
  email: string
  password: string
}

export async function seedUser(app: INestApplication, userData: SeedUserData): Promise<User> {
  const dataSource = app.get(DataSource)
  const repo = dataSource.getRepository(User)
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  const user = repo.create({ name: userData.name, email: userData.email, password: hashedPassword })
  return repo.save(user)
}
