import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthCookieMiddleware } from 'src/courses/auth-cookie.middleware';
import { Purchase } from 'src/purchases/entities/purchases.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Purchase]), // 👈 ESTO ES LO QUE DA ACCESO AL REPOSITORY
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthCookieMiddleware)
      .forRoutes(
        { path: 'users/me', method: RequestMethod.GET }, // 🔐 proteger GET /users
        {
          path: 'users/me/courses',
          method: RequestMethod.GET,
        }, // 🔐 proteger cursos comprados
        { path: 'users/me', method: RequestMethod.PATCH }, // 🔐 proteger PATCH /users/:id
        { path: 'users/:id', method: RequestMethod.DELETE }, // 🔐 proteger DELETE /users/:id
      );
  }
}
