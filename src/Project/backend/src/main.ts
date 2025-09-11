import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 환경변수 디버깅
  console.log('🔍 환경변수 확인:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8080);
  console.log(`🚀 애플리케이션이 http://localhost:${process.env.PORT} 에서 실행 중입니다`);
}
bootstrap();
