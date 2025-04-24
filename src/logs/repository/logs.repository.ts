import { BaseRepository } from 'src/users/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Logs } from '../entities/logs.entity';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class LogsRepository extends BaseRepository {
  constructor(@InjectModel(Logs.name) private readonly logsModel: Model<Logs>) {
    super(logsModel);
  }

  async bulkInsertWithTransaction(data: Array<Logs>, session: ClientSession) {
    return await this.logsModel.insertMany(data, { session });
  }
}
