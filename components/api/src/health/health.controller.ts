import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async healthCheck() {
    const dbHealth = await this.healthService.checkDatabaseHealth();

    return {
      status: dbHealth.status === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }
}
