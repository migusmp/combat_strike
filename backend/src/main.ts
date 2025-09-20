import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: process.env.FRONTEND_URL, // Solo permite tu frontend en dev
  //   credentials: true, // si necesitas enviar cookies
  // });
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
  }

  app.use(cookieParser());

  const port = process.env.PORT || 3001;

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, '0.0.0.0');
  console.log(`Backend corriendo en puerto ${port}`);
}
bootstrap();
