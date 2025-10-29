import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

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

  async findCourseById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
  // -----------------------------
  // Delete course
  // -----------------------------
  async deleteCourse(id: number) {
    const course = await this.findCourseById(id);
    if (!course) throw new NotFoundException('Curso no encontrado');

    // 1️⃣ Borrar de la base de datos
    await this.repo.delete(id);

    // 2️⃣ Borrar archivos del disco
    const courseDir = path.join(process.cwd(), 'videos', String(id));
    try {
      await fs.rm(courseDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`No se pudieron borrar los archivos del curso ${id}:`, err);
    }

    return { message: 'Curso eliminado correctamente' };
  }
}
