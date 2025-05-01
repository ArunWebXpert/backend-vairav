import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './guard/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogsModule } from './logs/logs.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';
import { configValidationSchema } from './config/config.validation';
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

    UsersModule,

    TokensModule,

    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
