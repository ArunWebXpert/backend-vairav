import { Logs, LogsSchema } from './entities/logs.entity';
import { LogsRepository } from './repository/logs.repository';
import { LogsService } from './service/logs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './logs.controller';
import { SeedService } from './service/seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Logs.name,
        schema: LogsSchema,
      },
    ]),
  ],
  providers: [LogsService, LogsRepository, SeedService],
  controllers: [LogsController],
})
export class LogsModule {}
