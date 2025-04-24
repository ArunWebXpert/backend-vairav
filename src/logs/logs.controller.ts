import { Controller, Post } from '@nestjs/common';
import { LogsService } from './service/logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  async seedDB() {
    return await this.logsService.processLogs();
  }
}
