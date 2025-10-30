// src/courses/courses.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { AuthCookieMiddleware } from './auth-cookie.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesRepository } from './courses.repository';
import { PurchasesModule } from 'src/purchases/purchases.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    PurchasesModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
})
export class CoursesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCookieMiddleware).forRoutes(
      { path: 'courses/:courseId/full/playlist', method: RequestMethod.GET },
      { path: 'courses/upload-course', method: RequestMethod.POST },
      { path: 'courses/upload-course-zip', method: RequestMethod.POST },
      {
        path: 'courses/:courseId/full/segment/:segment',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/full/:sectionId/:videoId/playlist',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/full/:sectionId/:videoId/segment/:segment',
        method: RequestMethod.GET,
      },
      { path: 'courses/buy/:courseId', method: RequestMethod.POST },
    );
  }
}
