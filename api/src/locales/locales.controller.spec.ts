import { NotFoundException } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { LocaleQueryDto } from './dto/locale-query.dto'
import { Locale } from './entities/locale.entity'
import { LocalesController } from './locales.controller'
import { GetLocaleQuery, GetLocalesQuery } from './queries'

const EN: Locale = { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' }

describe('LocalesController', () => {
  let controller: LocalesController
  let queryBus: { execute: jest.Mock }

  beforeEach(async () => {
    queryBus = { execute: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalesController],
      providers: [{ provide: QueryBus, useValue: queryBus }],
    }).compile()

    controller = module.get<LocalesController>(LocalesController)
  })

  it('returns paginated locales via query bus', async () => {
    const result = new PaginatedResponseDto([EN], 1, 1, 20)
    queryBus.execute.mockResolvedValue(result)
    const query: LocaleQueryDto = { page: 1, limit: 20, pagination: true }

    const response = await controller.findMany(query)

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetLocalesQuery))
    expect(response).toEqual(result)
  })

  it('returns raw array when pagination=false', async () => {
    queryBus.execute.mockResolvedValue([EN])
    const query: LocaleQueryDto = { page: 1, limit: 20, pagination: false }

    const response = await controller.findMany(query)

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetLocalesQuery))
    expect(response).toEqual([EN])
  })

  it('returns locale by code via query bus', async () => {
    queryBus.execute.mockResolvedValue(EN)

    const response = await controller.findOne('en')

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetLocaleQuery))
    expect(response).toEqual(EN)
  })

  it('throws NotFoundException when locale code is not found', async () => {
    queryBus.execute.mockResolvedValue(null)

    await expect(controller.findOne('xx')).rejects.toThrow(NotFoundException)
  })
})
