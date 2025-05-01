import Lang from '@constants/language';
import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as maxmind from 'maxmind';
import mongoose from 'mongoose';
import * as readline from 'readline';
import { convertToTimestamp } from 'src/utils/date.utils';
import { Logs } from '../entities/logs.entity';
import { LogsRepository } from '../repository/logs.repository';
import { UserService } from 'src/users/service/users.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  private lookup: maxmind.Reader<any>;
  private readonly errorLogFile = 'error_logs.jsonl';

  private readonly apacheLogRegex =
    /^([\d.]+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+)\s*(\S*) HTTP\/[\d.]+" (\d{3}) (\d+|-) "(.*?)" "(.*?)"/;
  private readonly nginxLogRegex =
    /^([\d.]+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+)\s*(\S*) HTTP\/[\d.]+" (\d{3}) (\d+|-) "(.*?)" "(.*?)"/;

  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly userService: UserService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {
    // this.initMaxmind();
  }

  //   private async initMaxmind() {
  //     try {
  //       this.lookup = await maxmind.open(
  //         '../../geo-location-file/GeoLite2-ASN.mmdb',
  //       );
  //       this.logger.log('MaxMind initialized successfully');
  //     } catch (err) {
  //       this.logger.error(`Failed to initialize MaxMind: ${err.message}`);
  //       throw err;
  //     }
  //   }

  //   private getGeolocation(ip: string): Logs['address'] {
  //     try {
  //       const data = this.lookup.get(ip);
  //       return data
  //         ? {
  //             country: data.country?.names?.en || '',
  //             region: data.subdivisions?.[0]?.names?.en || '',
  //             city: data.city?.names?.en || '',
  //             location: {
  //               type: 'Point',
  //               coordinates: [
  //                 data.location?.longitude || 0,
  //                 data.location?.latitude || 0,
  //               ],
  //             },
  //           }
  //         : {
  //             country: '',
  //             region: '',
  //             city: '',
  //             location: { type: 'Point', coordinates: [0, 0] },
  //           };
  //     } catch (err) {
  //       this.logger.error(`Geolocation error for IP ${ip}: ${err.message}`);
  //       return {
  //         country: '',
  //         region: '',
  //         city: '',
  //         location: { type: 'Point', coordinates: [0, 0] },
  //       };
  //     }
  //   }

  private parseLogLine(line: string, source: string): Logs | null {
    try {
      const regex =
        source === 'apache' ? this.apacheLogRegex : this.nginxLogRegex;

      const match = line.match(regex);

      if (!match) {
        throw new Error('Invalid log format');
      }

      const ip = match[1];

      const address = {
        country: 'Nepal',
        region: 'Kathmandu',
        city: 'Pharping',
        location: {
          type: 'Point',
          coordinates: [0, 0] as [number, number],
        },
      };

      const obj = {
        ip: ip ?? '',
        timestamp: convertToTimestamp(match[4]).toDate(),
        method: match[5] ?? '',
        url: match[6] ?? '',
        protocol: match[7] || 'HTTP/1.1',
        statusCode: Number(match[8]) || 0,
        bytes: match[9] === '-' ? 0 : Number(match[9]),
        referer: match[10] === '-' ? '' : match[10],
        userAgent: match[11] === '-' ? '' : match[11],
        source,
        address,
      };

      console.log({ obj });

      return obj;
    } catch (err) {
      fs.appendFileSync(
        this.errorLogFile,
        JSON.stringify({ line, source, error: err }) + '\n',
      );
      return null;
    }
  }

  async processLogFile(filePath: string, source: string) {
    const batchSize = 1000;

    let batch: Logs[] = [];

    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const parsed = this.parseLogLine(line, source);

      if (parsed) {
        batch.push(parsed);
      }

      if (batch.length >= batchSize) {
        await this.processBatch(batch);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.processBatch(batch);
    }
  }

  private async processBatch(batch: Logs[]) {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(
        async () => {
          await this.logsRepository.bulkInsertWithTransaction(batch, session);
          this.logger.log(`Inserted ${batch.length} logs`);
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        },
      );
    } catch (err) {
      this.logger.log('Transaction failed...');
      this.logger.error(`Error processing batch: ${err}`);
      // Transaction is automatically rolled back
      batch.forEach((doc) => {
        fs.appendFileSync(
          this.errorLogFile,
          JSON.stringify({
            line: JSON.stringify(doc),
            source: doc.source,
            error: err,
          }) + '\n',
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async retryFailedLogs() {
    if (!fs.existsSync(this.errorLogFile)) {
      return;
    }

    const errorLines = fs
      .readFileSync(this.errorLogFile, 'utf8')
      .split('\n')
      .filter((line) => line);
    let batch: Logs[] = [];
    const batchSize = 5000;

    for (const error of errorLines) {
      const { line, source } = JSON.parse(error);
      const parsed = this.parseLogLine(line, source);

      if (parsed) {
        batch.push(parsed);
      }

      if (batch.length >= batchSize) {
        await this.processBatch(batch);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.processBatch(batch);
    }

    fs.unlinkSync(this.errorLogFile);
    this.logger.log('Retry completed and error log cleared');
  }

  async seedUser() {
    const userCount = await this.userService.countUsers();

    if (userCount > 0) {
      throw new ConflictException({ message: Lang.CLEAN_DB_BEFORE_SEEDING });
    }

    const userList = [
      {
        firstName: 'Arun',
        lastName: 'Chapagain',
        email: 'arun@gmail.com',
        password: 'Arun@123',
        role: 'admin',
      },
      {
        firstName: 'Dipesh',
        lastName: 'Gyawali',
        email: 'dipesh@gmail.com',
        password: 'Dipesh@123',
        role: 'nginx',
      },
      {
        firstName: 'Ujjwal',
        lastName: 'Suwal',
        email: 'ujjwal@gmail.com',
        password: 'Ujjwal@123',
        role: 'apache',
      },
    ];

    await Promise.all(
      userList.map(async (item) => {
        return this.userService.registerUser(item);
      }),
    );
  }

  async processLogs() {
    // find logs
    const logsCount = await this.logsRepository.countDocuments();

    if (logsCount > 0) {
      throw new UnprocessableEntityException(Lang.CLEAN_DB_BEFORE_SEEDING);
    }

    const apacheLogFile = 'src/logs/log-files/apache_logs.txt';
    const nginxLogFile = 'src/logs/log-files/nginx_logs.txt';

    try {
      if (fs.existsSync(this.errorLogFile)) {
        fs.unlinkSync(this.errorLogFile);
      }

      await this.processLogFile(apacheLogFile, 'apache');
      await this.processLogFile(nginxLogFile, 'nginx');
      await this.retryFailedLogs();

      this.logger.log('All logs processed successfully');
    } catch (err) {
      this.logger.error(`Fatal error: ${err}`);
      throw err;
    }
  }

  //   main seed  function
  async seedDB() {
    await this.processLogs();
    await this.seedUser();
  }
}
