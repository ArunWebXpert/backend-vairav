import { Logs, LogsSchema } from './entities/logs.entity';
import { LogsController } from './logs.controller';
import { LogsRepository } from './repository/logs.repository';
import { LogsService } from './service/logs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsStatService } from './service/logs-stat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Logs.name,
        schema: LogsSchema,
      },
    ]),
  ],
  providers: [LogsService, LogsRepository, LogsStatService],
  controllers: [LogsController],
})
export class LogsModule {}
