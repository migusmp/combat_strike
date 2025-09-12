import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si necesitas enviar cookies
  });

  app.use(cookieParser());

  const port = process.env.PORT || 3001;

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
  console.log(`Backend corriendo en puerto ${port}`);
}
bootstrap();
