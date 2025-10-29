// src/courses/courses.controller.ts
import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // --- PREVIEW ---
  @Get(':courseId/preview/playlist')
  async getPreviewPlaylist(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const playlistPath = path.join(
      __dirname,
      '../../videos',
      courseId,
      'preview',
      'preview.m3u8',
    );
    if (!fs.existsSync(playlistPath))
      return res.status(404).send('Playlist no encontrada');
    res.sendFile(playlistPath);
  }

  @Get(':courseId/preview/segment/:segment')
  async getPreviewSegment(
    @Param('courseId') courseId: string,
    @Param('segment') segment: string,
    @Res() res: Response,
  ) {
    const segmentPath = path.join(
      __dirname,
      '../../videos',
      courseId,
      'preview',
      segment,
    );
    if (!fs.existsSync(segmentPath))
      return res.status(404).send('Segmento no encontrado');
    res.sendFile(segmentPath);
  }

  // --- FULL ---
  @Get(':courseId/full/playlist')
  async getFullPlaylist(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!req.user) {
      return res.status(401).send('No autorizado');
    }
    const userId = req.user.id;
    if (!(await this.coursesService.userHasAccess(userId, courseId))) {
      return res.status(403).send('No tienes acceso a este curso');
    }

    const playlistPath = path.join(
      __dirname,
      '../../videos',
      courseId,
      'full',
      'full.m3u8',
    );
    if (!fs.existsSync(playlistPath))
      return res.status(404).send('Playlist no encontrada');
    res.sendFile(playlistPath);
  }

  @Get(':courseId/full/segment/:segment')
  async getFullSegment(
    @Param('courseId') courseId: string,
    @Param('segment') segment: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!req.user) {
      return res.status(401).send('No autorizado');
    }

    if (!(await this.coursesService.userHasAccess(req.user.id, courseId))) {
      return res.status(403).send('No tienes acceso a este curso');
    }

    const segmentPath = path.join(
      __dirname,
      '../../videos',
      courseId,
      'full',
      segment,
    );
    if (!fs.existsSync(segmentPath))
      return res.status(404).send('Segmento no encontrado');
    res.sendFile(segmentPath);
  }
}
