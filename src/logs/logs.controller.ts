import { Controller, Get, Post } from '@nestjs/common';
import { LogsService } from './service/logs.service';
import { ROLE } from '@constants/enum/role.enum';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('seed')
  async seedDB() {
    return await this.seedService.processLogs();
  }

  @Get('total-events')
  async getTotalEvents() {
    return await this.logsService.getTotalEvents({ role: ROLE.ADMIN });
  }

  @Get('active-ip')
  async getMostActiveIP() {
    return await this.logsService.getMostActiveIpAddress({ role: ROLE.ADMIN });
  }

  @Get('common-method')
  async getMostCommonMethod() {
    return await this.logsService.getMostCommonMethod({ role: ROLE.ADMIN });
  }
}
