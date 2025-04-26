import { ActiveIPResponse } from './dto/response/active-ip.response';
import { BarChartInput } from './dto/input/bar-chart-input';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { LogTableDataInput } from './dto/input/log-table-data.input';
import { LogsService } from './service/logs.service';
import { ROLE } from '@constants/enum/role.enum';
import { SeedService } from './service/seed.service';
import { TotalEventsResponse } from './dto/response/total-events.response';

@Controller('logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly seedService: SeedService,
  ) {}

  @Post('seed')
  async seedDB() {
    return await this.seedService.processLogs();
  }

  @Get('total-events')
  async getTotalEvents(): Promise<TotalEventsResponse> {
    return await this.logsService.getTotalEvents({ role: ROLE.ADMIN });
  }

  @Get('active-ip')
  async getMostActiveIP(): Promise<ActiveIPResponse> {
    return await this.logsService.getMostActiveIpAddress({ role: ROLE.ADMIN });
  }

  @Get('common-method')
  async getMostCommonMethod() {
    return await this.logsService.getMostCommonMethod({ role: ROLE.ADMIN });
  }

  @Get('http-status-code')
  async getTopHttpStatusCode() {
    return await this.logsService.getTopHttpStatusCode({ role: ROLE.ADMIN });
  }

  @Get('response-size')
  async getMostCommonResponseSize() {
    return await this.logsService.mostCommonResponseSize({ role: ROLE.ADMIN });
  }

  @Get('user-agent')
  async getTopUserAgent() {
    return await this.logsService.getTopUserAgent({ role: ROLE.ADMIN });
  }

  @Get('bar-chart-data')
  async getBarChartData(@Query() barChartInput: BarChartInput) {
    console.log(barChartInput);
    return await this.logsService.getBarChartData({
      role: ROLE.ADMIN,
      dateOption: barChartInput.date_option,
    });
  }

  @Get('log-data')
  async getLogData(@Query() logTableDataInput: LogTableDataInput) {
    return await this.logsService.getLogTableData({
      role: ROLE.ADMIN,
      ...logTableDataInput,
    });
  }
}
