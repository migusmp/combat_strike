// src/courses/courses.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoursesService {
  // Aquí defines si un usuario tiene acceso a un curso
  async userHasAccess(userId: number, courseId: string): Promise<boolean> {
    // Lógica real: consultar DB si el usuario compró el curso
    // Por ejemplo:
    // return await this.courseRepository.hasUserAccess(userId, courseId);
    return true; // para pruebas
  }
}
