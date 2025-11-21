import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProgressController } from './course-progress.controller';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from './course-progress.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Purchase } from 'src/purchases/entities/purchases.entity';
import { AuthCookieMiddleware } from 'src/courses/auth-cookie.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([CourseProgress, Course, Purchase])],
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCookieMiddleware).forRoutes(
      { path: 'courses/:courseId/progress', method: RequestMethod.ALL },
      { path: 'courses/:courseId/progress/summary', method: RequestMethod.ALL },
    );
  }
}
