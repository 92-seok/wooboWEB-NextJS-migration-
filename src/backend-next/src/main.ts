import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:80',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 8081;
  await app.listen(port);
  console.log(
    `🚀 Portfolio Backend: http://localhost:${port} (Prisma + Supabase)`,
  );
}

bootstrap();
