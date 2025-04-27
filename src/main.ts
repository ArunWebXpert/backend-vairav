import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.enableCors();

  const PORT = process.env.API_PORT ?? 8080;

  await app.listen(PORT, () => {
    Logger.log(`App is running on port: ${PORT}`);
  });
}

bootstrap();
