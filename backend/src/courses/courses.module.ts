// src/courses/courses.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { AuthCookieMiddleware } from './auth-cookie.middleware';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCookieMiddleware).forRoutes(
      { path: 'courses/:courseId/full/playlist', method: RequestMethod.GET },
      {
        path: 'courses/:courseId/full/segment/:segment',
        method: RequestMethod.GET,
      },
    );
  }
}
