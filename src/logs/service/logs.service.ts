import { BadRequestException, Injectable } from '@nestjs/common';
import { IRole } from './../interface/role.interface';
import { LogTableDataInput } from '../dto/input/log-table-data.input';
import { LogsRepository } from '../repository/logs.repository';
import { ROLE } from '@constants/enum/role.enum';
import * as dayjs from 'dayjs';
import { getSourceFilter } from 'src/utils/source-filter.utils';
import { TotalEventsResponse } from '../dto/response/total-events.response';
import { ActiveIPResponse } from '../dto/response/active-ip.response';

@Injectable()
export class LogsService {
  constructor(private readonly logsRepository: LogsRepository) {}

  //   total events
  async getTotalEvents({ role }: IRole): Promise<TotalEventsResponse> {
    const match = getSourceFilter(role);

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
  async getMostActiveIpAddress({ role }: IRole): Promise<ActiveIPResponse> {
    const match = getSourceFilter(role);

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
    const match = getSourceFilter(role);

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

  //   top http status code
  async getTopHttpStatusCode({ role }: IRole) {
    const match = getSourceFilter(role);

    const [topHttpStatusCode] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$statusCode',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return topHttpStatusCode
      ? { statusCode: topHttpStatusCode._id, count: topHttpStatusCode.count }
      : { statusCode: null, count: 0 };
  }

  //   most common response size
  async mostCommonResponseSize({ role }: IRole) {
    const match = getSourceFilter(role);

    const [commonBytes] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$bytes',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return commonBytes
      ? { bytes: commonBytes._id, count: commonBytes.count }
      : { bytes: null, count: 0 };
  }

  //   most common  user agent
  async getTopUserAgent({ role }: IRole) {
    const match = getSourceFilter(role);

    const [commonAgent] = await this.logsRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userAgent',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return commonAgent
      ? { agent: commonAgent._id, count: commonAgent.count }
      : { agent: null, count: 0 };
  }

  // get bar chart data
  async getBarChartData({
    role,
    dateOption,
  }: {
    role: ROLE;
    dateOption: string;
  }): Promise<{ _id: Date; count: number }[]> {
    const match = getSourceFilter(role);

    const dateFormat =
      dateOption === 'year'
        ? '%Y'
        : dateOption === 'month'
          ? '%b-%Y'
          : '%Y-%m-%d';

    const res: { _id: Date; count: number }[] =
      await this.logsRepository.aggregate([
        { $match: match },

        {
          $group: {
            _id: {
              $dateTrunc: {
                date: '$timestamp',
                unit: dateOption,
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        {
          $project: {
            _id: 0,
            count: 1,
            date: { $dateToString: { format: dateFormat, date: '$_id' } },
          },
        },
      ]);

    return res;
  }

  // get log table data
  async getLogTableData({
    search,
    startDate,
    endDate,
    role,
    page,
    limit,
  }: LogTableDataInput & IRole): Promise<void> {
    // check if start date is greater than end date
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      throw new BadRequestException('Start date cannot be after end date.');
    }

    const match = getSourceFilter(role);

    if (search) {
      match['$or'] = [
        { ip: { $regex: search } },
        { 'address.country': { $regex: search } },
        { 'address.region': { $regex: search } },
        { 'address.city': { $regex: search } },
      ];
    }

    console.log({ startDate, endDate });

    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) {
        match.timestamp.$gte = startDate;
      }
      if (endDate) {
        match.timestamp.$lte = endDate;
      }
    }

    console.log({ match });

    const res = await this.logsRepository.aggregatePaginate(
      [
        {
          $match: match,
        },
        { $sort: { timestamp: -1 } },
        {
          $project: {
            ip: 1,
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            method: 1,
            url: 1,
            protocol: 1,
            statusCode: 1,
            responseSize: '$bytes',
            source: 1,
            country: '$address.country',
            region: '$address.region',
            city: '$address.city',
          },
        },
      ],
      { page, limit },
    );

    return res;
  }
}
