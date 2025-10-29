import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  async uploadCourse(courseData: Partial<Course>) {
    const course = this.repo.create(courseData);
    return this.repo.save(course);
  }

  async findCourseById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
