import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'backend',
      timestamp: true,
      logLevels: ['log', 'error', 'warn'],
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const PORT = process.env.API_PORT ?? 8080;

  await app.listen(PORT, () => {
    Logger.log(`App is running on port: ${PORT}`);
  });
}

bootstrap();
