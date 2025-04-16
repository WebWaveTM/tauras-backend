import { Controller, Get, Inject } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { ExposeAllDto } from './common/dto/expose-all.dto';
import {
  PRISMA_SERVICE_INJECTION_TOKEN,
  type PrismaService,
} from './infrastructure/database/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    @Inject(PRISMA_SERVICE_INJECTION_TOKEN)
    private readonly prismaService: PrismaService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator
  ) {}

  @Get('/health')
  @HealthCheck()
  async check() {
    const healthCheckResult = await this.healthCheckService.check([
      () =>
        this.prismaHealthIndicator.pingCheck('database', this.prismaService),
      () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 4096 * 1024 * 1024),
      () =>
        this.diskHealthIndicator.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.75,
        }),
    ]);

    return new ExposeAllDto(healthCheckResult);
  }
}
