import { Injectable, ForbiddenException } from '@nestjs/common';
import { FullCourseData } from './interfaces/courses.interfaces';
import { CoursesRepository } from './courses.repository';
import { PurchasesService } from 'src/purchases/purchases.service';
import * as path from 'path';
import * as fs from 'fs/promises';
const ffmpeg = require('fluent-ffmpeg');

/**
 * Servicio principal para la gestión de cursos.
 *
 * Contiene toda la lógica de negocio relacionada con los cursos:
 * - Creación y registro de cursos.
 * - Conversión de vídeos a formato HLS (.m3u8 y .ts).
 * - Generación de playlists maestras.
 * - Verificación de acceso del usuario a cursos comprados.
 */
@Injectable()
export class CoursesService {
  private readonly videoRoot = path.join(process.cwd(), 'videos');

  constructor(
    private readonly courseRepository: CoursesRepository,
    private readonly purchasesService: PurchasesService,
  ) {}

  private getCoursePath(
    courseId: number | string,
    ...segments: string[]
  ): string {
    return path.join(this.videoRoot, String(courseId), ...segments);
  }

  private async ensureDirExists(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  private async convertToHls(
    inputPath: string,
    playlistPath: string,
    segmentPattern: string,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
          '-hls_segment_filename',
          segmentPattern,
        ])
        .output(playlistPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  private async rewritePlaylistSegments(
    playlistPath: string,
    segmentFolder = 'segment',
  ): Promise<void> {
    const playlist = await fs.readFile(playlistPath, 'utf8');
    const updated = playlist
      .split(/\r?\n/)
      .map((line) => {
        if (!line || line.startsWith('#')) return line;
        const trimmed = line.trim();
        if (trimmed.includes('/')) return trimmed;
        if (trimmed.endsWith('.ts')) return `${segmentFolder}/${trimmed}`;
        return trimmed;
      })
      .join('\n');

    await fs.writeFile(playlistPath, updated, 'utf8');
  }

  // ----------------------------------------------------------------
  // 🔐 Verificar si un usuario tiene acceso a un curso
  // ----------------------------------------------------------------

  /**
   * Comprueba si un usuario tiene acceso autorizado a un curso.
   *
   * Este método consulta la base de datos a través del `PurchasesService`
   * para determinar si el usuario ha comprado el curso especificado.
   * Si el usuario no tiene acceso, se lanza una excepción `ForbiddenException`.
   *
   * @param userId - ID del usuario autenticado.
   * @param courseId - ID del curso que se desea acceder.
   * @returns `true` si el usuario tiene acceso autorizado.
   *
   * @throws `ForbiddenException` si el usuario no tiene acceso al curso.
   *
   * @example
   * ```ts
   * const canAccess = await this.userHasAccess(1, '10');
   * if (!canAccess) throw new ForbiddenException('No tienes acceso a este curso');
   * ```
   */
  async userHasAccess(userId: number, courseId: string): Promise<boolean> {
    const numericCourseId = Number(courseId);
    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // 1️⃣ Verificar si el usuario ha comprado el curso
    const hasPurchased = await this.purchasesService.hasUserPurchasedCourse(
      userId,
      numericCourseId,
    );

    // 2️⃣ Si no lo ha comprado, denegar acceso
    if (!hasPurchased) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // 3️⃣ Permitir acceso
    return true;
  }

  // ----------------------------------------------------------------
  // 🔍 Buscar curso por ID
  // ----------------------------------------------------------------

  /**
   * Busca un curso en la base de datos por su identificador.
   *
   * @param id - ID del curso.
   * @returns La entidad del curso si existe, o `null` si no se encuentra.
   */
  async findCourseById(id: number) {
    return this.courseRepository.findCourseById(id);
  }

  // ----------------------------------------------------------------
  // 🧩 Crear curso en la base de datos
  // ----------------------------------------------------------------

  /**
   * Registra un nuevo curso en la base de datos a partir de los datos completos.
   *
   * @param courseData - Objeto con todos los datos del curso.
   * @returns El curso creado.
   */
  async createCourse(courseData: FullCourseData) {
    return this.courseRepository.uploadCourse(courseData);
  }

  // ----------------------------------------------------------------
  // 🎥 Subida y conversión de videos (Full / Preview)
  // ----------------------------------------------------------------

  /**
   * Sube un nuevo curso junto con sus videos y los convierte a formato HLS.
   *
   * @param courseData - Datos completos del curso.
   * @param fullVideoPath - Ruta del video principal (completo).
   * @param previewVideoPath - Ruta opcional del video de vista previa.
   *
   * @throws `Error` si falla la conversión de los videos.
   */
  async uploadCourse(
    courseData: FullCourseData,
    fullVideoPath: string,
    previewVideoPath?: string,
  ) {
    const newCourse = await this.createCourse(courseData);

    try {
      // 1️⃣ Convertir video completo
      await this.convertVideoToHLS(newCourse.id, fullVideoPath, 'full');

      // 2️⃣ Convertir video de preview si existe
      if (previewVideoPath) {
        await this.convertVideoToHLS(newCourse.id, previewVideoPath, 'preview');
      }
    } catch (err) {
      // Si falla la conversión, eliminar el curso creado
      await this.courseRepository.deleteCourse(newCourse.id);
      throw new Error(`Error al convertir video: ${err.message}`);
    }
  }

  // ----------------------------------------------------------------
  // 🧩 Conversión genérica de un video (Full o Preview)
  // ----------------------------------------------------------------

  /**
   * Convierte un video en formato HLS (.m3u8 + segmentos .ts)
   * para compatibilidad con streaming adaptativo.
   *
   * @param courseId - ID del curso al que pertenece el video.
   * @param inputPath - Ruta al archivo original (.mp4).
   * @param type - Tipo de video: `'full'` o `'preview'`.
   */
  async convertVideoToHLS(
    courseId: number,
    inputPath: string,
    type: 'full' | 'preview',
  ) {
    const outputDir = this.getCoursePath(courseId, type);
    await this.ensureDirExists(outputDir);
    const playlistPath = path.join(outputDir, `${type}.m3u8`);
    const segmentPattern = path.join(outputDir, 'segment%03d.ts');

    await this.convertToHls(inputPath, playlistPath, segmentPattern);

    // Post-procesar rutas del .m3u8
    try {
      await this.rewritePlaylistSegments(playlistPath);
    } catch (err) {
      console.error('Error postprocesando playlist:', err);
      throw err;
    }
  }

  // ----------------------------------------------------------------
  // 🎬 Conversión por clase individual (Full Course)
  // ----------------------------------------------------------------

  /**
   * Convierte un video individual (por clase) a formato HLS.
   *
   * Genera los archivos `.m3u8` y los segmentos `.ts` en carpetas
   * organizadas por curso, sección y video.
   *
   * @param courseId - ID del curso.
   * @param sectionId - ID o nombre de la sección.
   * @param videoId - ID o nombre del video.
   * @param inputPath - Ruta al archivo original del video.
   * @returns Ruta al archivo `.m3u8` generado.
   */
  async convertFullVideoToHLS(
    courseId: number,
    sectionId: string,
    videoId: string,
    inputPath: string,
  ): Promise<string> {
    const outputDir = this.getCoursePath(courseId, 'full', sectionId, videoId);
    await this.ensureDirExists(outputDir);
    const playlistPath = path.join(outputDir, `${videoId}.m3u8`);
    const segmentPattern = path.join(outputDir, `${videoId}_segment%03d.ts`);

    await this.convertToHls(inputPath, playlistPath, segmentPattern);

    // Ajustar rutas dentro de la playlist generada
    try {
      await this.rewritePlaylistSegments(playlistPath);
    } catch (err) {
      console.error('Error postprocesando playlist:', err);
      throw err;
    }

    return playlistPath;
  }

  // ----------------------------------------------------------------
  // 🎵 Generar playlist maestra del curso completo
  // ----------------------------------------------------------------

  /**
   * Combina todas las playlists individuales de clases en una playlist maestra `full.m3u8`.
   *
   * @param courseId - ID del curso.
   * @param entries - Lista de secciones, videos y sus rutas `.m3u8`.
   *
   * @throws `Error` si no hay videos válidos para incluir.
   */
  async generateFullMasterPlaylist(
    courseId: number,
    entries: Array<{ sectionId: string; videoId: string; playlistPath: string }>,
  ) {
    if (!entries.length) {
      throw new Error('No se encontraron videos completos para generar la playlist.');
    }

    const masterDir = this.getCoursePath(courseId, 'full');
    await this.ensureDirExists(masterDir);

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
