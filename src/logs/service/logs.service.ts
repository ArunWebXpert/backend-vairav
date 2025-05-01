import { ROLE } from '@constants/enum/role.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { getSourceFilter } from 'src/utils/source-filter.utils';
import { LogTableDataInput } from '../dto/input/log-table-data.input';
import { ActiveIPResponse } from '../dto/response/active-ip.response';
import { TotalEventsResponse } from '../dto/response/total-events.response';
import { LogsRepository } from '../repository/logs.repository';
import { IRole } from './../interface/role.interface';

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

    // status code of only success messages
    match.statusCode = {
      $in: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
    };

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
        { $limit: 10 },
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
  }: LogTableDataInput & IRole) {
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

  // get all stat data in on place
  async getStat({ role }: IRole) {
    const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), ms),
        ),
      ]);

    const maxQueryTime = 1000; //ms

    const [
      totalEvents,
      commonIP,
      commonMethod,
      statusCode,
      commonBytes,
      topUserAgent,
    ] = await Promise.allSettled([
      timeout(this.getTotalEvents({ role }), maxQueryTime),
      timeout(this.getMostActiveIpAddress({ role }), maxQueryTime),
      timeout(this.getMostCommonMethod({ role }), maxQueryTime),
      timeout(this.getTopHttpStatusCode({ role }), maxQueryTime),
      timeout(this.mostCommonResponseSize({ role }), maxQueryTime),
      timeout(this.getTopUserAgent({ role }), maxQueryTime),
    ]);

    const response = {
      totalEvents:
        totalEvents.status === 'fulfilled'
          ? totalEvents.value.totalEvents
          : null,
      commonIP: commonIP.status === 'fulfilled' ? commonIP.value.ip : null,
      commonMethod:
        commonMethod.status === 'fulfilled' ? commonMethod.value.method : null,
      statusCode:
        statusCode.status === 'fulfilled' ? statusCode.value.statusCode : null,
      commonBytes:
        commonBytes.status === 'fulfilled' ? commonBytes.value.bytes : 0,
      topUserAgent:
        topUserAgent.status === 'fulfilled' ? topUserAgent.value.agent : null,
    };

    return response;
  }
}
