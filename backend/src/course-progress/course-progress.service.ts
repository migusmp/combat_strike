import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgress } from './course-progress.entity';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Course } from 'src/courses/entities/course.entity';
import { Purchase } from 'src/purchases/entities/purchases.entity';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private readonly progressRepo: Repository<CourseProgress>,
    @InjectRepository(Course)
    private readonly coursesRepo: Repository<Course>,
    @InjectRepository(Purchase)
    private readonly purchasesRepo: Repository<Purchase>,
  ) {}

  private async ensureOwnership(userId: number, courseId: number) {
    const purchase = await this.purchasesRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId }, status: 'COMPLETED' },
    });
    if (!purchase) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }
  }

  async upsertProgress(userId: number, courseId: number, dto: UpdateProgressDto) {
    await this.ensureOwnership(userId, courseId);

    const course = await this.coursesRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const completed = dto.positionSeconds / dto.durationSeconds >= 0.98;
    const existing = await this.progressRepo.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        sectionSlug: dto.sectionSlug,
        classSlug: dto.classSlug,
      },
    });

    const payload: Partial<CourseProgress> = {
      user: { id: userId } as any,
      course: { id: courseId } as any,
      sectionSlug: dto.sectionSlug,
      classSlug: dto.classSlug,
      positionSeconds: dto.positionSeconds,
      durationSeconds: dto.durationSeconds,
      completedAt: completed ? new Date() : null,
    };

    return this.progressRepo.save(existing ? { ...existing, ...payload } : this.progressRepo.create(payload));
  }

  async getProgress(userId: number, courseId: number) {
    await this.ensureOwnership(userId, courseId);
    return this.progressRepo.find({
      where: { user: { id: userId }, course: { id: courseId } },
      order: { updatedAt: 'DESC' },
    });
  }
}
