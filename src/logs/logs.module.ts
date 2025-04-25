import { Logs, LogsSchema } from './entities/logs.entity';
import { LogsRepository } from './repository/logs.repository';
import { LogsService } from './service/logs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Logs.name,
        schema: LogsSchema,
      },
    ]),
  ],
  providers: [LogsService, LogsRepository],
  controllers: [LogsController],
})
export class LogsModule {}
