import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CourseProgressService } from './course-progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import type { Request } from 'express';
import { RequestUser } from 'src/types/request';

@Controller('courses/:courseId/progress')
export class CourseProgressController {
  constructor(private readonly service: CourseProgressService) {}

  @Put()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
    @Body() body: UpdateProgressDto,
  ) {
    const user = req.user as RequestUser | undefined;
    if (!user) {
      // El middleware de auth debería poblar req.user; si no está, devolvemos 401
      throw new UnauthorizedException();
    }
    return this.service.upsertProgress(user.id, courseId, body);
  }

  @Get()
  list(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: Request) {
    const user = req.user as RequestUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.service.getProgress(user.id, courseId);
  }

  @Get('summary')
  summary(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: Request) {
    const user = req.user as RequestUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.service.getProgressSummary(user.id, courseId);
  }
}
