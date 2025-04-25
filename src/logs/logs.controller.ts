import { Controller, Get, Post } from '@nestjs/common';
import { LogsService } from './service/logs.service';
import { LogsStatService } from './service/logs-stat.service';

@Controller('logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly logsStatService: LogsStatService,
  ) {}

  @Post()
  async seedDB() {
    return await this.logsService.processLogs();
  }

  @Get()
  async getLogsStat() {
    return await this.logsStatService.getLogsStat();
  }
}
