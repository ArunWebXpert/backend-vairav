import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as maxmind from 'maxmind';
import mongoose from 'mongoose';
import * as readline from 'readline';
import { Logs } from '../entities/logs.entity';
import { LogsRepository } from '../repository/logs.repository';
import dayjs from 'dayjs';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private lookup: maxmind.Reader<any>;
  private readonly errorLogFile = 'error_logs.jsonl';

  private readonly apacheLogRegex =
    /^([\d.]+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+)\s*(\S*) HTTP\/[\d.]+" (\d{3}) (\d+|-) "(.*?)" "(.*?)"/;
  private readonly nginxLogRegex =
    /^([\d.]+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+)\s*(\S*) HTTP\/[\d.]+" (\d{3}) (\d+|-) "(.*?)" "(.*?)"/;

  constructor(
    private readonly logsRepository: LogsRepository,
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
      console.log({ match });

      if (!match) {
        throw new Error('Invalid log format');
      }

      //   console.log('NEPAL');
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

      return {
        ip: ip ?? '',
        // timestamp: new Date(match[4]),
        timestamp: match[4] ?? '',

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

      //   return {
      //     ip: '130.89.1.236',
      //     timestamp: '23/May/2015:13:05:14 +0000',
      //     method: 'GET',
      //     url: '/downloads/product_2',
      //     protocol: 'HTTP/1.1',
      //     statusCode: 404,
      //     bytes: 336,
      //     referer: '',
      //     userAgent: 'Debian APT-HTTP/1.3 (1.0.1ubuntu2)',
      //     source: 'nginx',
      //     address: {
      //       country: 'Nepal',
      //       region: 'Kathmandu',
      //       city: 'Pharping',
      //       location: {
      //         type: 'Point',
      //         coordinates: [85.324, 27.7172],
      //       },
      //     },
      //   };
    } catch (err) {
      fs.appendFileSync(
        this.errorLogFile,
        JSON.stringify({ line, source, error: err }) + '\n',
      );
      console.log('what');
      return null;
    }
  }

  async processLogFile(filePath: string, source: string) {
    console.log('here1');
    const batchSize = 1000;
    let batch: Logs[] = [];

    const fileStream = fs.createReadStream(filePath);
    // console.log({ fileStream });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // console.log({ rl });

    for await (const line of rl) {
      const parsed = this.parseLogLine(line, source);

      console.log({ parsed });

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
    console.log({ batch });
    const session = await this.connection.startSession();

    console.log('Before transaction');
    try {
      await session.withTransaction(
        async () => {
          await this.logsRepository.bulkInsertWithTransaction(batch, session);
          console.log(`Inserted ${batch.length} logs`);
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        },
      );
    } catch (err) {
      console.log('Transaction failed...');
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
    console.log('After transaction');
  }

  async retryFailedLogs() {
    if (!fs.existsSync(this.errorLogFile)) return;

    const errorLines = fs
      .readFileSync(this.errorLogFile, 'utf8')
      .split('\n')
      .filter((line) => line);
    let batch: Logs[] = [];
    const batchSize = 100;

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

  //   main seed  function
  async processLogs() {
    console.log('here');
    const apacheLogFile = 'src/logs/log-files/apache_logs.txt';
    const nginxLogFile = 'src/logs/log-files/nginx_logs.txt';

    try {
      if (fs.existsSync(this.errorLogFile)) {
        fs.unlinkSync(this.errorLogFile);
      }

      await this.processLogFile(apacheLogFile, 'apache');
      //   await this.processLogFile(nginxLogFile, 'nginx');
      await this.retryFailedLogs();

      this.logger.log('All logs processed successfully');
    } catch (err) {
      this.logger.error(`Fatal error: ${err}`);
      throw err;
    }
  }
}
