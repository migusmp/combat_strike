// src/courses/courses.service.ts
import { Injectable } from '@nestjs/common';
import { FullCourseData } from './interfaces/courses.interfaces';
import { CoursesRepository } from './courses.repository';
import * as path from 'path';
import * as fs from 'fs/promises';
// courses.service.ts
const ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CoursesRepository) { }
  // Aquí defines si un usuario tiene acceso a un curso
  async userHasAccess(userId: number, courseId: string): Promise<boolean> {
    // Lógica real: consultar DB si el usuario compró el curso
    // Por ejemplo:
    // return await this.courseRepository.hasUserAccess(userId, courseId);
    return true; // para pruebas
  }

  async createCourse(courseData: FullCourseData) {
    return this.courseRepository.uploadCourse(courseData);
  }

  async uploadCourse(
    courseData: FullCourseData,
    fullVideoPath: string,
    previewVideoPath?: string,
  ) {
    // 1️⃣ Guardar el curso en la base de datos
    const newCourse = await this.courseRepository.uploadCourse(courseData);

    try {
      // 2️⃣ Convertir el video completo a HLS
      await this.convertVideoToHLS(newCourse.id, fullVideoPath, 'full');

      // 3️⃣ Convertir preview si existe
      if (previewVideoPath) {
        await this.convertVideoToHLS(newCourse.id, previewVideoPath, 'preview');
      }
    } catch (err) {
      // opcional: borrar curso de DB si falla la conversión
      await this.courseRepository.deleteCourse(newCourse.id);
      throw new Error(`Error al convertir video: ${err.message}`);
    }
  }

  // 🧩 Versión simple (ya existente) para preview o un solo video completo
  async convertVideoToHLS(courseId: number, inputPath: string, type: 'full' | 'preview') {
    const outputDir = path.join(process.cwd(), 'videos', String(courseId), type);
    await fs.mkdir(outputDir, { recursive: true });

    const playlistPath = path.join(outputDir, `${type}.m3u8`);
    const segmentPattern = path.join(outputDir, 'segment%03d.ts');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
          '-hls_segment_filename', segmentPattern,
        ])
        .output(playlistPath)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
        .run();
    });

    // Post-procesar el .m3u8 para ajustar rutas
    try {
      let playlist = await fs.readFile(playlistPath, 'utf8');
      const lines = playlist.split(/\r?\n/).map((line) => {
        if (!line || line.startsWith('#')) return line;
        const trimmed = line.trim();
        if (trimmed.includes('/')) return trimmed;
        if (trimmed.endsWith('.ts')) return `segment/${trimmed}`;
        return trimmed;
      });

      await fs.writeFile(playlistPath, lines.join('\n'), 'utf8');
    } catch (err) {
      console.error('Error postprocesando playlist:', err);
      throw err;
    }
  }

  // 🧠 Nueva versión para cursos divididos por secciones y vídeos
  async convertFullVideoToHLS(
    courseId: number,
    sectionId: string,
    videoId: string,
    inputPath: string,
  ): Promise<string> {
    // 📁 Estructura: videos/{courseId}/full/{sectionId}/{videoId}/
    const outputDir = path.join(process.cwd(), 'videos', String(courseId), 'full', sectionId, videoId);
    await fs.mkdir(outputDir, { recursive: true });

    const playlistPath = path.join(outputDir, `${videoId}.m3u8`);
    const segmentPattern = path.join(outputDir, `${videoId}_segment%03d.ts`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
          '-hls_segment_filename', segmentPattern,
        ])
        .output(playlistPath)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
        .run();
    });

    // Post-procesar la playlist para que los paths sean relativos
    try {
      let playlist = await fs.readFile(playlistPath, 'utf8');
      const lines = playlist.split(/\r?\n/).map((line) => {
        if (!line || line.startsWith('#')) return line;
        const trimmed = line.trim();
        if (trimmed.includes('/')) return trimmed;
        if (trimmed.endsWith('.ts')) return `segment/${trimmed}`;
        return trimmed;
      });

      await fs.writeFile(playlistPath, lines.join('\n'), 'utf8');
    } catch (err) {
      console.error('Error postprocesando playlist:', err);
      throw err;
    }

    return playlistPath;
  }

  async generateFullMasterPlaylist(
    courseId: number,
    entries: Array<{ sectionId: string; videoId: string; playlistPath: string }>,
  ) {
    if (!entries.length) {
      throw new Error('No se encontraron videos completos para generar la playlist.');
    }

    const masterDir = path.join(process.cwd(), 'videos', String(courseId), 'full');
    await fs.mkdir(masterDir, { recursive: true });
    const masterPath = path.join(masterDir, 'full.m3u8');

    const masterLines: string[] = [];
    let maxDuration = 0;

    for (const entry of entries) {
      const playlist = await fs.readFile(entry.playlistPath, 'utf8');
      const lines = playlist.split(/\r?\n/);

      for (const line of lines) {
        if (!line) continue;
        if (line.startsWith('#EXTINF')) {
          const durationStr = line.split(':')[1]?.split(',')[0];
          const duration = Number(durationStr);
          if (!Number.isNaN(duration)) {
            maxDuration = Math.max(maxDuration, Math.ceil(duration));
          }
          masterLines.push(line.trim());
        } else if (!line.startsWith('#')) {
          const trimmed = line.trim();
          masterLines.push(`${entry.sectionId}/${entry.videoId}/${trimmed}`);
        }
      }
    }

    if (!masterLines.length) {
      throw new Error('No se pudieron agregar segmentos a la playlist completa.');
    }

    const header = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${Math.max(1, maxDuration || 10)}`,
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXT-X-PLAYLIST-TYPE:VOD',
    ];

    const content = [...header, ...masterLines, '#EXT-X-ENDLIST'].join('\n');
    await fs.writeFile(masterPath, content, 'utf8');
  }
}
