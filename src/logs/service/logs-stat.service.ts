import { Injectable } from '@nestjs/common';
import { LogsRepository } from '../repository/logs.repository';

@Injectable()
export class LogsStatService {
  constructor(private readonly logsRepository: LogsRepository) {}

  async getLogsStat(): Promise<any[]> {
    //  i need to group by statusCode also
    const logData = await this.logsRepository.aggregate([
      {
        $match: {},
      },
      {
        $facet: {
          'method-stat': [
            {
              $group: {
                _id: '$method',
                count: { $sum: 1 },
              },
            },
          ],
          'status-stat': [
            {
              $group: {
                _id: '$statusCode',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return logData;
  }
}
