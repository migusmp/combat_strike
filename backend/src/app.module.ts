import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { CoursesModule } from './courses/courses.module';
import { PurchasesService } from './purchases/purchases.service';
import { PurchasesController } from './purchases/purchases.controller';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carga variables .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = config.get<number>('DB_PORT');
        if (!port) {
          throw new Error('La variable de entorno DB_PORT no está definida');
        }

        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: +port,
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    CoursesModule,
    PurchasesModule, // módulo de autenticación
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
  exports: [MailService],
})
export class AppModule {}
