import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  healthcheck() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    }
  }
}
