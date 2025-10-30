import { Injectable } from '@nestjs/common';
import { FullCourseData } from './interfaces/courses.interfaces';
import { CoursesRepository } from './courses.repository';
import * as path from 'path';
import * as fs from 'fs/promises';
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
  async findCourseById(id: number) {
    return this.courseRepository.findCourseById(id);
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

  // 🧠 Convierte un video completo (por clase) a formato HLS (.m3u8 y segmentos .ts)
// Esta función procesa cada video dentro de un curso y lo convierte a un formato 
// compatible con streaming adaptativo (HLS), generando una carpeta por video.
async convertFullVideoToHLS(
  courseId: number,   // ID del curso en la base de datos
  sectionId: string,  // ID o nombre normalizado de la sección (por ejemplo "defensas-personales")
  videoId: string,    // ID o nombre normalizado del video (por ejemplo "ataque-frontal")
  inputPath: string,  // Ruta al archivo de video original (.mp4) que se quiere convertir
): Promise<string> {
  
  // 📁 Define la estructura de carpetas donde se guardará el video convertido.
  // Ejemplo: videos/12/full/defensas-personales/ataque-frontal/
  const outputDir = path.join(
    process.cwd(),
    'videos',
    String(courseId),
    'full',
    sectionId,
    videoId,
  );

  // Crea el directorio de salida (si no existe).
  // La opción { recursive: true } asegura que también se creen las carpetas intermedias.
  await fs.mkdir(outputDir, { recursive: true });

  // Ruta del archivo de playlist (.m3u8) que genera HLS.
  const playlistPath = path.join(outputDir, `${videoId}.m3u8`);

  // Patrón que define el nombre de los segmentos de video (.ts) generados por FFmpeg.
  // %03d indica que se numerarán con 3 dígitos (segment001.ts, segment002.ts, etc.)
  const segmentPattern = path.join(outputDir, `${videoId}_segment%03d.ts`);

  // 🎬 Lanza el proceso de conversión con FFmpeg
  // FFmpeg divide el video en pequeños fragmentos de ~10 segundos
  // y genera un archivo .m3u8 con la lista de reproducción de esos fragmentos.
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline',  // Perfil bajo para compatibilidad amplia (ej. navegadores móviles)
        '-level 3.0',           // Nivel de compresión (equilibrio entre calidad y compatibilidad)
        '-start_number 0',      // Empieza numerando los segmentos desde 0
        '-hls_time 10',         // Duración de cada segmento (en segundos)
        '-hls_list_size 0',     // Incluye todos los segmentos en la playlist (no limitada)
        '-f hls',               // Formato de salida: HTTP Live Streaming
        '-hls_segment_filename', segmentPattern, // Patrón para nombrar los archivos .ts
      ])
      .output(playlistPath)     // Archivo de salida principal (.m3u8)
      .on('end', () => resolve())   // Cuando termina correctamente
      .on('error', (err: any) => reject(err)) // Si ocurre un error durante la conversión
      .run();                        // Ejecuta FFmpeg
  });

  // 🧩 Post-procesamiento de la playlist (.m3u8)
  // El archivo .m3u8 generado puede contener rutas absolutas o inconsistentes.
  // Aquí se ajustan los paths para que sean relativos a la carpeta del video.
  try {
    // Lee el contenido del archivo de playlist
    let playlist = await fs.readFile(playlistPath, 'utf8');

    // Recorre cada línea de la playlist y modifica las rutas de los segmentos
    const lines = playlist.split(/\r?\n/).map((line) => {
      // Si la línea está vacía o comienza con "#" (metadatos de HLS), no se modifica
      if (!line || line.startsWith('#')) return line;

      const trimmed = line.trim();

      // Si la línea ya contiene una ruta con "/", se deja igual (ya es relativa o completa)
      if (trimmed.includes('/')) return trimmed;

      // Si es una referencia a un archivo .ts, se coloca dentro de una carpeta "segment"
      if (trimmed.endsWith('.ts')) return `segment/${trimmed}`;

      // Si no cumple ninguna condición, se deja sin cambios
      return trimmed;
    });

    // Sobrescribe la playlist con las rutas corregidas
    await fs.writeFile(playlistPath, lines.join('\n'), 'utf8');
  } catch (err) {
    console.error('Error postprocesando playlist:', err);
    throw err; // Propaga el error para que el proceso de conversión falle correctamente
  }

  // ✅ Devuelve la ruta del archivo .m3u8 generado, que servirá para el master playlist
  return playlistPath;
}


  // 🧩 Genera una "playlist maestra" (full.m3u8) que agrupa todos los videos del curso
// Esta función combina todas las playlists individuales (.m3u8) de cada clase/sección 
// en una sola lista que representa el curso completo en formato HLS.
async generateFullMasterPlaylist(
  courseId: number,  // ID del curso en la base de datos
  entries: Array<{ 
    sectionId: string;   // Identificador o nombre de la sección (por ejemplo "defensas-personales")
    videoId: string;     // Identificador o nombre del video (por ejemplo "ataque-frontal")
    playlistPath: string; // Ruta absoluta al archivo .m3u8 generado para ese video
  }>,
) {
  // 🚫 Verifica que haya al menos un video procesado
  if (!entries.length) {
    throw new Error('No se encontraron videos completos para generar la playlist.');
  }

  // 📁 Crea el directorio donde se guardará la playlist maestra
  // Estructura: videos/{courseId}/full/full.m3u8
  const masterDir = path.join(process.cwd(), 'videos', String(courseId), 'full');
  await fs.mkdir(masterDir, { recursive: true });

  // Ruta completa del archivo final de playlist maestra
  const masterPath = path.join(masterDir, 'full.m3u8');

  // Array que contendrá todas las líneas de las playlists individuales
  const masterLines: string[] = [];

  // Guarda la duración máxima de los segmentos (necesario para la cabecera HLS)
  let maxDuration = 0;

  // 🔁 Recorre cada playlist generada (una por clase)
  for (const entry of entries) {
    // Lee el contenido del archivo .m3u8 correspondiente a la clase
    const playlist = await fs.readFile(entry.playlistPath, 'utf8');

    // Divide el contenido en líneas individuales
    const lines = playlist.split(/\r?\n/);

    // Procesa cada línea de la playlist individual
    for (const line of lines) {
      if (!line) continue; // Omitir líneas vacías

      // 🎵 Las líneas que comienzan con "#EXTINF" contienen la duración del segmento
      if (line.startsWith('#EXTINF')) {
        // Extrae la duración del segmento (número después de ":")
        const durationStr = line.split(':')[1]?.split(',')[0];
        const duration = Number(durationStr);

        // Actualiza la duración máxima encontrada (para el header final)
        if (!Number.isNaN(duration)) {
          maxDuration = Math.max(maxDuration, Math.ceil(duration));
        }

        // Añade esta línea de duración al array maestro
        masterLines.push(line.trim());
      } 
      // 📺 Si la línea no empieza con "#", es una ruta a un segmento .ts
      else if (!line.startsWith('#')) {
        const trimmed = line.trim();

        // Agrega el path completo relativo:
        // sección/video/segmento.ts
        // Ejemplo: defensas-personales/ataque-frontal/ataque-frontal_segment001.ts
        masterLines.push(`${entry.sectionId}/${entry.videoId}/${trimmed}`);
      }
    }
  }

  // 🚨 Si no se añadió ningún segmento, se lanza error
  if (!masterLines.length) {
    throw new Error('No se pudieron agregar segmentos a la playlist completa.');
  }

  // 🏷️ Cabecera estándar del formato HLS (.m3u8)
  // Define parámetros globales para toda la lista
  const header = [
    '#EXTM3U',                                  // Identificador del formato HLS
    '#EXT-X-VERSION:3',                         // Versión HLS utilizada
    `#EXT-X-TARGETDURATION:${Math.max(1, maxDuration || 10)}`, // Duración máxima esperada de cada segmento
    '#EXT-X-MEDIA-SEQUENCE:0',                  // Primer número de secuencia
    '#EXT-X-PLAYLIST-TYPE:VOD',                 // Indica que es contenido bajo demanda (Video On Demand)
  ];

  // 🧾 Combina el encabezado + contenido de todos los segmentos + cierre
  const content = [
    ...header,
    ...masterLines,
    '#EXT-X-ENDLIST', // Marca el final de la playlist
  ].join('\n');

  // 💾 Escribe la playlist maestra en disco
  await fs.writeFile(masterPath, content, 'utf8');
}

}
