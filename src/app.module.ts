import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { configValidationSchema } from './config/config.validation';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: configValidationSchema,
      cache: true,
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbName = configService.get<string>('DB_NAME');
        const dbOptions = configService.get<string>('DB_OPTIONS');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbUserName = configService.get<string>('DB_USERNAME');

        return {
          uri: `mongodb+srv://${dbUserName}:${encodeURIComponent(dbPassword as string)}@${dbHost}/${dbName}?${dbOptions}`,
        };
      },

      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
