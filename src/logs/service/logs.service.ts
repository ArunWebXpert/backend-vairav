import { IRole } from '../interface/role.interface';
import { Injectable } from '@nestjs/common';
import { LogsRepository } from '../repository/logs.repository';
import { ROLE } from '@constants/enum/role.enum';

@Injectable()
export class LogsService {
  constructor(private readonly logsRepository: LogsRepository) {}

  //   total events
  async getTotalEvents({ role }: IRole) {
    const match = [ROLE.APACHE, ROLE.NGINX].includes(role)
      ? { source: role }
      : {};

    const [result] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    return { totalEvents: result?.count || 0 };
  }

  //   most active ip address
  async getMostActiveIpAddress({ role }: IRole) {
    const match: Record<string, string> = [ROLE.APACHE, ROLE.NGINX].includes(
      role,
    )
      ? { source: role }
      : {};

    const [mostActiveIp] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$ip',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return mostActiveIp
      ? { ip: mostActiveIp._id, count: mostActiveIp.count }
      : { ip: null, count: 0 };
  }

  //   most active ip address
  async getMostCommonMethod({ role }: IRole) {
    const match: Record<string, string> = [ROLE.APACHE, ROLE.NGINX].includes(
      role,
    )
      ? { source: role }
      : {};

    const [mostCommonMethod] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$method',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return mostCommonMethod
      ? { method: mostCommonMethod._id, count: mostCommonMethod.count }
      : { method: null, count: 0 };
  }
}
