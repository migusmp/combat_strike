import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Body,
  UploadedFiles,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import slugify from 'slugify';
import type { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { CoursesService } from './courses.service';
import { ContentCourse, FullCourseData } from './interfaces/courses.interfaces';
import { diskStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { PurchasesService } from 'src/purchases/purchases.service';
import { RequestUser } from 'src/types/request';



/**
 * --- CONTROLADOR DE VIDEOS DE PREVISUALIZACIÓN ---
 *
 * Estos endpoints manejan los videos de tipo “preview” (muestras gratuitas)
 * que cualquier usuario puede visualizar sin autenticación.
 *
 * Los videos están en formato HLS (HTTP Live Streaming),
 * lo que significa que el video se divide en segmentos `.ts`
 * y una playlist `.m3u8` que indica el orden de reproducción.
 */
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly purchasesService: PurchasesService,
  ) {}

  /**
   * Obtiene el usuario autenticado desde la request o lanza una excepción si no está presente.
   *
   * Este método se utiliza para simplificar la obtención del usuario en rutas protegidas.
   * Si la cookie o el token no existen (o no se ha pasado por el middleware de autenticación),
   * lanza automáticamente una excepción `UnauthorizedException`.
   *
   * @param req - Objeto `Request` de Express que contiene la información de la solicitud.
   * @param unauthorizedMessage - Mensaje personalizado para la excepción (opcional).
   * @returns El objeto `RequestUser` (usuario autenticado).
   *
   * @throws `UnauthorizedException` si no existe un usuario autenticado en la request.
   *
   * @example
   * ```ts
   * const user = this.getUserOrThrow(req);
   * console.log(user.id); // ID del usuario autenticado
   * ```
   */
  private getUserOrThrow(
    req: Request,
    unauthorizedMessage = 'No autorizado',
  ): RequestUser {
    const user = req.user as RequestUser | undefined;
    if (!user) {
      throw new UnauthorizedException(unauthorizedMessage);
    }
    return user;
  }

  // --- 🔁 Helper recursivo para recorrer subcarpetas ---
  private async getAllFilesRecursive(dir: string): Promise<string[]> {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory()
          ? await this.getAllFilesRecursive(fullPath)
          : fullPath;
      }),
    );
    return files.flat();
  }

  // Helper to map section folders and infer structure when JSON lacks content info.
  private async discoverSectionFolders(
    extractPath: string,
    rootEntries: string[],
  ): Promise<{
    folderMap: Map<string, string>;
    filesCache: Map<string, string[]>;
    fallbackContent: ContentCourse[];
  }> {
    const folderMap = new Map<string, string>();
    const filesCache = new Map<string, string[]>();
    const fallbackContent: ContentCourse[] = [];

    for (const entry of rootEntries) {
      const lowerName = entry.toLowerCase();
      if (lowerName === 'coursedata.json') continue;
      if (
        lowerName.endsWith('.json') ||
        lowerName.endsWith('.mp4') ||
        lowerName.endsWith('.mov') ||
        lowerName.endsWith('.mkv') ||
        lowerName.endsWith('.vtt') ||
        lowerName.endsWith('.srt') ||
        lowerName.startsWith('__macosx')
      ) {
        continue;
      }

      const candidatePath = path.join(extractPath, entry);

      try {
        const files = await this.getAllFilesRecursive(candidatePath);
        const sectionSlug = slugify(entry, { lower: true, strict: true });
        folderMap.set(sectionSlug, entry);
        filesCache.set(sectionSlug, files);

        const classTitles = Array.from(
          new Set(
            files
              .filter((filePath) => filePath.toLowerCase().endsWith('.mp4'))
              .map((filePath) => path.parse(filePath).name),
          ),
        );

        if (!classTitles.length) continue;

        fallbackContent.push({
          sectionTitle: entry,
          classes: classTitles.map((title) => ({
            title,
            duration: { hours: 0, minutes: 0 },
          })),
        });
      } catch {
        // entry is not a directory; ignore
      }
    }

    return { folderMap, filesCache, fallbackContent };
  }

  /**
   * Verifica que el usuario autenticado tenga rol de administrador.
   *
   * Este método reutiliza `getUserOrThrow` para comprobar que el usuario esté autenticado,
   * y luego valida que su propiedad `role` sea `'admin'`.
   * Si el usuario no cumple estas condiciones, lanza una excepción `UnauthorizedException`.
   *
   * @param req - Objeto `Request` de Express con los datos del usuario autenticado.
   * @returns El usuario autenticado con rol de administrador.
   *
   * @throws `UnauthorizedException` si el usuario no está autenticado o no es administrador.
   *
   * @example
   * ```ts
   * const admin = this.ensureAdmin(req);
   * console.log(admin.role); // "admin"
   * ```
   */
  private ensureAdmin(req: Request): RequestUser {
    const user = this.getUserOrThrow(req, 'No autorizado');
    if (user.role !== 'admin') {
      throw new UnauthorizedException('No autorizado');
    }
    return user;
  }

  /**
   * Verifica de forma asíncrona si una ruta o archivo existe en el sistema de archivos.
   *
   * Este método utiliza `fs.promises.access()` para comprobar la existencia de un archivo
   * o carpeta sin lanzar excepciones en caso de error.
   * Devuelve `true` si la ruta es accesible, `false` si no lo es.
   *
   * @param filePath - Ruta absoluta o relativa al archivo o carpeta.
   * @returns `true` si la ruta existe, `false` en caso contrario.
   *
   * @example
   * ```ts
   * const exists = await this.pathExists('/uploads/video.mp4');
   * if (!exists) throw new NotFoundException('Archivo no encontrado');
   * ```
   */
  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fsp.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Envía un archivo al cliente si existe en el sistema de archivos.
   *
   * @param res - Objeto de respuesta de Express.
   * @param filePath - Ruta absoluta del archivo que se desea enviar.
   * @param notFoundMessage - Mensaje personalizado en caso de que el archivo no exista.
   *
   * Flujo:
   *  1️⃣ Verifica si el archivo existe usando `fs.promises.access`.
   *  2️⃣ Si existe, se envía el archivo con `res.sendFile()`.
   *  3️⃣ Si no existe, se lanza una excepción `NotFoundException` (NestJS la transforma en un 404).
   *
   * Ejemplo de uso:
   * ```ts
   * const videoPath = this.getVideoPath(courseId, 'preview', 'intro.mp4');
   * await this.sendFileIfExists(res, videoPath, 'El video de vista previa no se encontró.');
   * ```
   */
  private async sendFileIfExists(
    res: Response,
    filePath: string,
    notFoundMessage: string,
  ) {
    try {
      // Verifica si el archivo existe y es accesible
      await fsp.access(filePath);

      // Envía el archivo directamente como respuesta
      res.sendFile(filePath);
    } catch {
      // Si no se encuentra el archivo, lanza una excepción 404
      throw new NotFoundException(notFoundMessage);
    }
  }

  /**
   * Construye la ruta absoluta hacia un video de un curso.
   *
   * @param courseId - ID del curso al que pertenece el video.
   * @param type - Tipo de carpeta: puede ser 'preview' (video de muestra) o 'full' (videos del curso completo).
   * @param segments - Partes adicionales de la ruta (por ejemplo: `section1`, `intro.mp4`).
   *
   * @returns Ruta absoluta del archivo de video dentro del proyecto.
   *
   * Ejemplo de estructura de carpetas esperada:
   * ```
   * videos/
   * ├── 101/
   * │   ├── preview/
   * │   │   └── preview.mp4
   * │   └── full/
   * │       ├── section1.mp4
   * │       └── section2.mp4
   * ```
   *
   * Ejemplo de uso:
   * ```ts
   * const path = this.getVideoPath('101', 'full', 'section1.mp4');
   * ```
   */
  private getVideoPath(
    courseId: string,
    type: 'preview' | 'full',
    ...segments: string[]
  ): string {
    // Crea una ruta absoluta hacia el video dentro del directorio del proyecto
    return path.join(process.cwd(), 'videos', courseId, type, ...segments);
  }
  /**
   * Endpoint para comprar un curso
   *
   * Ruta: POST /courses/buy/:courseId
   *
   * Flujo:
   *  1️⃣ Verifica que el usuario esté autenticado.
   *  2️⃣ Comprueba que el curso exista.
   *  3️⃣ Revisa si el usuario ya compró el curso.
   *  4️⃣ (Opcional futuro) Procesa el pago mediante una pasarela (Stripe / PayPal).
   *  5️⃣ Registra la compra en la base de datos.
   *  6️⃣ Devuelve una respuesta con los datos del curso.
   */
  @Post('buy/:courseId')
  async buyCourse(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = this.getUserOrThrow(req, 'Usuario no autenticado');
    const numericCourseId = Number(courseId);

    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
      throw new BadRequestException('Identificador de curso inválido');
    }

    try {
      // 2️⃣ Verificar que el curso exista
      const course = await this.coursesService.findCourseById(numericCourseId);
      if (!course) {
        throw new NotFoundException('Curso no encontrado');
      }

      // 3️⃣ Comprobar si el usuario ya lo compró
      const alreadyPurchased =
        await this.purchasesService.hasUserPurchasedCourse(
          userId,
          numericCourseId,
        );
      if (alreadyPurchased) {
        throw new ConflictException('Ya has comprado este curso');
      }

      // 🚀 4️⃣ Aquí iría la integración con la pasarela de pago
      /**
       * Ejemplo futuro:
       *
       * const paymentIntent = await stripe.paymentIntents.create({
       *   amount: course.price * 100, // en céntimos
       *   currency: 'eur',
       *   metadata: { userId: user.id, courseId },
       * });
       *
       * // Esperar confirmación del pago (webhook o client confirmation)
       * // Una vez confirmado:
       * await this.purchasesService.registerPurchase(user.id, Number(courseId));
       */

      // 5️⃣ Registrar la compra (sin pago de momento)
      await this.purchasesService.registerPurchase(userId, numericCourseId);

      // 6️⃣ Responder al cliente con éxito
      return res.status(HttpStatus.OK).json({
        message: 'Curso comprado exitosamente',
        course: {
          title: course.title,
          price: course.price,
        },
      });
    } catch (err) {
      // Si ya es una excepción HTTP (Conflict, NotFound, Unauthorized, etc.)
      if (err instanceof HttpException) {
        throw err;
      }

      // Si es un error inesperado
      throw new InternalServerErrorException('Error al procesar la compra');
    }
  }

  /**
   * 🔹 Endpoint: `GET /courses/get-courses`
   *
   * Obtiene la lista completa de cursos disponibles en la base de datos.
   *
   * Este método solicita todos los cursos almacenados a través del servicio `CoursesService`
   * y devuelve los resultados en formato JSON con código de estado **200 OK**.
   *
   * Si ocurre algún error interno durante la obtención de los datos (por ejemplo,
   * un fallo de conexión con la base de datos), lanza una excepción
   * `InternalServerErrorException` con un mensaje genérico.
   *
   * @param res - Objeto `Response` de Express utilizado para devolver la respuesta HTTP.
   * @returns Una respuesta JSON con la lista de cursos.
   *
   * @throws `InternalServerErrorException` si ocurre un error inesperado al obtener los cursos.
   *
   * @example
   * **Solicitud:**
   * ```http
   * GET /courses/get-courses
   * ```
   *
   * **Respuesta exitosa (200):**
   * ```json
   * [
   *   {
   *     "id": 1,
   *     "title": "Krav Maga: Defensa Personal Intensiva",
   *     "description": "Curso práctico de defensa personal",
   *     "price": "59.99",
   *     "category": "Defensa Personal",
   *     "rating": 4.8,
   *     "isNew": true,
   *     "language": "Español"
   *   },
   *   {
   *     "id": 2,
   *     "title": "Boxeo Avanzado",
   *     "description": "Mejora tus técnicas de combate y velocidad",
   *     "price": "49.99",
   *     "category": "Deportes de Combate",
   *     "rating": 4.6,
   *     "isNew": false,
   *     "language": "Español"
   *   }
   * ]
   * ```
   */
  @Get('get-courses')
  async getCourses(@Res() res: Response) {
    try {
      // 1️⃣ Obtener todos los cursos de la base de datos mediante el servicio
      const courses = await this.coursesService.getAllCourses();

      // 2️⃣ Enviar respuesta exitosa con los cursos en formato JSON
      return res.status(HttpStatus.OK).json(courses);
    } catch (err) {
      // 3️⃣ Capturar y registrar errores en consola
      console.error('Error al obtener cursos:', err);

      // 4️⃣ Lanzar excepción genérica controlada
      throw new InternalServerErrorException('Error al obtener los cursos');
    }
  }

  /**
   * --- PREVIEW PLAYLIST ---
   *
   * Endpoint público para obtener la **playlist** (`.m3u8`) de previsualización del curso.
   *
   * Ruta: `GET /courses/:courseId/preview/playlist`
   *
   * Ejemplo de uso:
   * ```bash
   * GET /courses/12/preview/playlist
   * ```
   *
   * Flujo:
   *  1️⃣ Construye la ruta absoluta al archivo `preview.m3u8`.
   *  2️⃣ Verifica si existe y lo envía al cliente.
   *  3️⃣ Si no existe, lanza un `NotFoundException (404)`.
   */
  @Get(':courseId/preview/playlist')
  async getPreviewPlaylist(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ): Promise<void> {
    // Construir la ruta absoluta a la playlist
    const playlistPath = this.getVideoPath(courseId, 'preview', 'preview.m3u8');

    // Enviar el archivo si existe, o lanzar un error si no
    await this.sendFileIfExists(
      res,
      playlistPath,
      'Playlist de preview no encontrada',
    );
  }

  /**
   * --- PREVIEW SEGMENT ---
   *
   * Endpoint público para servir **segmentos individuales** de la previsualización.
   *
   * En streaming HLS, cada video está dividido en varios archivos `.ts`
   * (por ejemplo, `segment0.ts`, `segment1.ts`, ...).
   *
   * Ruta: `GET /courses/:courseId/preview/segment/:segment`
   *
   * Ejemplo de uso:
   * ```bash
   * GET /courses/12/preview/segment/segment2.ts
   * ```
   *
   * Flujo:
   *  1️⃣ Construye la ruta absoluta al segmento solicitado.
   *  2️⃣ Comprueba que exista y lo envía con `res.sendFile()`.
   *  3️⃣ Si no existe, lanza una excepción `NotFoundException (404)`.
   */
  @Get(':courseId/preview/segment/:segment')
  async getPreviewSegment(
    @Param('courseId') courseId: string,
    @Param('segment') segment: string,
    @Res() res: Response,
  ): Promise<void> {
    // Construir la ruta absoluta al segmento solicitado
    const segmentPath = this.getVideoPath(courseId, 'preview', segment);

    // Enviar el archivo si existe, o lanzar un error si no
    await this.sendFileIfExists(
      res,
      segmentPath,
      'Segmento de preview no encontrado',
    );
  }

  // --- FULL (requiere auth) ---
  @Get(':courseId/full/playlist')
  async getFullPlaylist(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = this.getUserOrThrow(req);
    const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    const playlistPath = this.getVideoPath(courseId, 'full', 'full.m3u8');
    await this.sendFileIfExists(
      res,
      playlistPath,
      'Playlist completa no encontrada',
    );
  }

  @Get(':courseId/full/segment/:segment')
  async getFullSegment(
    @Param('courseId') courseId: string,
    @Param('segment') segment: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = this.getUserOrThrow(req);
    const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    const segmentPath = this.getVideoPath(courseId, 'full', segment);
    await this.sendFileIfExists(
      res,
      segmentPath,
      'Segmento completo no encontrado',
    );
  }

  /**
   * --- FULL COURSE PLAYLIST ---
   *
   * Endpoint para obtener la **playlist HLS (`.m3u8`)** de un video completo
   * perteneciente a un curso comprado por el usuario.
   *
   * Ruta protegida: `GET /courses/:courseId/full/:sectionId/:videoId/playlist`
   *
   * Ejemplo de uso:
   *
   * GET /courses/101/full/section1/video1/playlist
   *
   *
   * Flujo:
   *  1️⃣ Verifica que el usuario esté autenticado (`req.user`).
   *  2️⃣ Comprueba si el usuario **tiene acceso** (ha comprado el curso).
   *  3️⃣ Construye la ruta absoluta a la playlist del video.
   *  4️⃣ Verifica si el archivo existe y lo envía al cliente.
   *  5️⃣ Si el usuario no tiene acceso o el archivo no existe, lanza excepciones adecuadas.
   */
  @Get(':courseId/full/:sectionId/:videoId/playlist')
  async getFullVideoPlaylist(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // 1️⃣ Verificar autenticación del usuario
    const { id: userId } = this.getUserOrThrow(req);

    // 2️⃣ Comprobar acceso al curso (usuario debe haberlo comprado)
    const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // 3️⃣ Construir la ruta hacia la playlist del video completo
    const playlistPath = this.getVideoPath(
      courseId,
      'full',
      sectionId,
      videoId,
      `${videoId}.m3u8`,
    );

    // 4️⃣ Enviar la playlist si existe o lanzar error si no
    await this.sendFileIfExists(
      res,
      playlistPath,
      `Playlist no encontrada para ${sectionId}/${videoId}`,
    );
  }

  /**
   * --- FULL COURSE SEGMENT ---
   *
   * Endpoint protegido para obtener **un segmento (.ts)** de un video completo del curso.
   *
   * Ruta protegida:
   * `GET /courses/:courseId/full/:sectionId/:videoId/segment/:segment`
   *
   * Ejemplo de uso:
   * ```bash
   * GET /courses/101/full/section1/video1/segment/segment3.ts
   * Cookie: auth=<jwt-token>
   * ```
   *
   * Flujo:
   *  1️⃣ Verifica que el usuario esté autenticado.
   *  2️⃣ Comprueba si tiene acceso (si ha comprado el curso).
   *  3️⃣ Construye la ruta absoluta al archivo de segmento (`.ts`).
   *  4️⃣ Envía el archivo al cliente si existe.
   *  5️⃣ Si no tiene acceso o el archivo no existe, lanza las excepciones correspondientes.
   */
  @Get(':courseId/full/:sectionId/:videoId/segment/:segment')
  async getFullVideoSegment(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('videoId') videoId: string,
    @Param('segment') segment: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // 1️⃣ Verificar autenticación
    const { id: userId } = this.getUserOrThrow(req);

    // 2️⃣ Comprobar si el usuario tiene acceso al curso
    const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // 3️⃣ Construir la ruta absoluta hacia el segmento solicitado
    const segmentPath = this.getVideoPath(
      courseId,
      'full',
      sectionId,
      videoId,
      segment,
    );

    // 4️⃣ Enviar el archivo si existe o lanzar error si no
    await this.sendFileIfExists(
      res,
      segmentPath,
      `Segmento no encontrado para ${sectionId}/${videoId}`,
    );
  }

  /**
   * --- SUBTÍTULOS DE PREVIEW (PÚBLICOS) ---
   * GET /courses/:courseId/preview/subtitles/:filename
   */
  @Get(':courseId/preview/subtitles/:filename')
  async getPreviewSubtitle(
    @Param('courseId') courseId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = this.getVideoPath(courseId, 'preview', filename);
    if (filename.endsWith('.vtt')) {
      res.type('text/vtt');
    }
    await this.sendFileIfExists(
      res,
      filePath,
      'Subtítulo de preview no encontrado',
    );
  }

  /**
   * --- SUBTÍTULOS DE CURSO COMPLETO (PROTEGIDOS) ---
   * GET /courses/:courseId/full/:sectionId/:videoId/subtitles/:filename
   */
  @Get(':courseId/full/:sectionId/:videoId/subtitles/:filename')
  async getFullSubtitle(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('videoId') videoId: string,
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { id: userId } = this.getUserOrThrow(req);
    const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
    if (!hasAccess)
      throw new ForbiddenException('No tienes acceso a este curso');

    const filePath = this.getVideoPath(
      courseId,
      'full',
      sectionId,
      videoId,
      filename,
    );
    await this.sendFileIfExists(res, filePath, 'Subtítulo no encontrado');
  }

  /**
   * --- UPLOAD COURSE ZIP ---
   *
   * Este endpoint permite **subir un curso completo comprimido en formato .zip**.
   *
   * El flujo incluye:
   *  1️⃣ Validar que el usuario sea administrador.
   *  2️⃣ Guardar el archivo ZIP temporalmente.
   *  3️⃣ Descomprimir el contenido (videos + JSON con metadatos).
   *  4️⃣ Registrar el curso en la base de datos.
   *  5️⃣ Convertir los videos a formato HLS (para streaming).
   *  6️⃣ Generar la playlist maestra.
   *  7️⃣ Limpiar archivos temporales.
   *
   * Ruta: `POST /courses/upload-course-zip`
   *
   * 📦 Estructura esperada dentro del ZIP:
   * ```
   * courseUpload.zip
   * ├── courseData.json
   * ├── preview.mp4
   * ├── Fundamentos/
   * │   ├── Introducción.mp4
   * │   └── Técnicas básicas.mp4
   * └── Defensas personales/
   *     └── Ataques múltiples.mp4
   * ```
   */
  @Post('upload-course-zip')
  @UseInterceptors(
    FileInterceptor('courseZip', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  async uploadCourseZip(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.ensureAdmin(req);
    const unzip = require('unzipper');

    const extractPath = path.join(
      process.cwd(),
      'uploads',
      'tmp',
      Date.now().toString(),
    );

    try {
      await fsp.mkdir(extractPath, { recursive: true });

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(file.path)
          .pipe(unzip.Extract({ path: extractPath }))
          .on('close', resolve)
          .on('error', reject);
      });

      const courseJsonPath = path.join(extractPath, 'courseData.json');
      const courseData: FullCourseData = JSON.parse(
        await fsp.readFile(courseJsonPath, 'utf-8'),
      );
      const rootEntries = await fsp.readdir(extractPath);
      const {
        folderMap: sectionFolderMap,
        filesCache: sectionFilesCache,
        fallbackContent,
      } = await this.discoverSectionFolders(extractPath, rootEntries);

      const createdCourse = await this.coursesService.createCourse(courseData);
      const courseId = createdCourse.id;

      // --- PREVIEW ---
      const previewPath = path.join(extractPath, 'preview.mp4');
      if (await this.pathExists(previewPath)) {
        await this.coursesService.convertVideoToHLS(
          courseId,
          previewPath,
          'preview',
        );
        const previewDir = path.join(
          process.cwd(),
          'videos',
          courseId.toString(),
          'preview',
        );
        await fsp.mkdir(previewDir, { recursive: true });

        const previewVtts = rootEntries.filter((f) =>
          f.toLowerCase().endsWith('.vtt'),
        );
        for (const sub of previewVtts) {
          await fsp.copyFile(
            path.join(extractPath, sub),
            path.join(previewDir, sub),
          );
        }
      }

      // --- FULL VIDEOS ---
      const generatedPlaylists: Array<{
        sectionId: string;
        videoId: string;
        playlistPath: string;
      }> = [];
      const contentToProcess =
        courseData.content && courseData.content.length
          ? courseData.content
          : fallbackContent;

      for (const section of contentToProcess) {
        const sectionSlug = slugify(section.sectionTitle, {
          lower: true,
          strict: true,
        });

        const sectionFolder = sectionFolderMap.get(sectionSlug);
        if (!sectionFolder) {
          console.warn(
            `⚠️ Carpeta no encontrada para sección: ${section.sectionTitle}`,
          );
          continue;
        }

        const sectionDir = path.join(extractPath, sectionFolder);
        const allFiles =
          sectionFilesCache.get(sectionSlug) ??
          (await this.getAllFilesRecursive(sectionDir));

        for (const classData of section.classes) {
          const videoSlug = slugify(classData.title, {
            lower: true,
            strict: true,
          });

          const videoFilePath = allFiles.find((p) => {
            const base = path.parse(p).name;
            return (
              slugify(base, { lower: true, strict: true }) === videoSlug &&
              p.toLowerCase().endsWith('.mp4')
            );
          });

          if (!videoFilePath) {
            console.warn(
              `⚠️ Video no encontrado para clase: ${classData.title}`,
            );
            continue;
          }

          const playlistPath = await this.coursesService.convertFullVideoToHLS(
            courseId,
            sectionSlug,
            videoSlug,
            videoFilePath,
          );

          // --- SUBTÍTULOS ---
          const subtitleDir = path.join(
            process.cwd(),
            'videos',
            courseId.toString(),
            'full',
            sectionSlug,
            videoSlug,
          );
          await fsp.mkdir(subtitleDir, { recursive: true });

          const subtitleFiles = allFiles.filter((p) => {
            if (!p.toLowerCase().endsWith('.vtt')) return false;
            const base = path.parse(p).name;
            return slugify(base, { lower: true, strict: true }).includes(
              videoSlug,
            );
          });

          if (subtitleFiles.length != 0) {
            for (const sub of subtitleFiles) {
              await fsp.copyFile(
                sub,
                path.join(subtitleDir, path.basename(sub)),
              );
            }
          }

          generatedPlaylists.push({
            sectionId: sectionSlug,
            videoId: videoSlug,
            playlistPath,
          });
        }
      }

      if (generatedPlaylists.length) {
        await this.coursesService.generateFullMasterPlaylist(
          courseId,
          generatedPlaylists,
        );
      } else {
        throw new Error(
          'El archivo ZIP no contiene videos completos para el curso.',
        );
      }

      return res.status(HttpStatus.CREATED).json({
        message: 'Curso subido y procesado correctamente',
        courseId,
      });
    } catch (err) {
      console.error('Error al subir curso:', err);
      return res.status(400).json({ message: err.message });
    } finally {
      await fsp
        .rm(extractPath, { recursive: true, force: true })
        .catch(() => undefined);
      if (file?.path)
        await fsp.rm(file.path, { force: true }).catch(() => undefined);
    }
  }

  // --- UPLOAD MANUAL ---
  @Post('upload-course')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fullVideo', maxCount: 1 },
        { name: 'previewVideo', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
          },
        }),
      },
    ),
  )

  /**
   * --- UPLOAD MANUAL COURSE ---
   *
   * Este endpoint permite **subir manualmente un curso y su video de previsualización (preview)**
   * desde el panel de administración, sin necesidad de empaquetarlo en un ZIP.
   *
   * Está diseñado para casos donde el administrador sube los videos y los datos del curso
   * por separado (por ejemplo, mediante un formulario en el dashboard).
   *
   * Ruta: `POST /courses/upload-course`
   *
   * 🔐 Solo los usuarios con rol `admin` pueden acceder a este endpoint.
   *
   * 📦 Archivos esperados:
   * - `fullVideo`: video completo del curso (`.mp4`)
   * - `previewVideo`: video de previsualización (`.mp4`, opcional)
   *
   * 🧾 Datos esperados:
   * - `courseData`: string JSON con los datos del curso (título, descripción, secciones, etc.)
   */
  @Post('upload-course')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        // Campo 1️⃣: video completo del curso
        { name: 'fullVideo', maxCount: 1 },

        // Campo 2️⃣: video de previsualización (opcional)
        { name: 'previewVideo', maxCount: 1 },
      ],
      {
        // Configuración del almacenamiento con Multer
        storage: diskStorage({
          destination: './uploads', // Carpeta donde se guardan temporalmente los archivos
          filename: (req, file, cb) => {
            // Genera un nombre único para evitar colisiones
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
          },
        }),
      },
    ),
  )
  async uploadCourse(
    @UploadedFiles()
    files: {
      fullVideo?: Express.Multer.File[];
      previewVideo?: Express.Multer.File[];
    },
    @Body('courseData') courseData: string, // JSON en texto con la info del curso
    @Req() req: Request, // Objeto Request (para validar usuario)
    @Res() res: Response, // Objeto Response (para devolver resultado)
  ) {
    // 1️⃣ Verificar autenticación y permisos de administrador
    this.ensureAdmin(req);

    try {
      // 2️⃣ Parsear los datos del curso desde el cuerpo del request
      const course: FullCourseData = JSON.parse(courseData);

      // 3️⃣ Extraer los archivos subidos (si existen)
      const fullVideo = files.fullVideo?.[0]; // video completo obligatorio
      const previewVideo = files.previewVideo?.[0]; // preview opcional

      // 4️⃣ Validar que el video completo esté presente
      if (!fullVideo) {
        throw new Error('Falta el video completo');
      }

      // 5️⃣ Delegar la creación del curso al servicio correspondiente
      // Este método se encargará de:
      //   - Registrar el curso en la base de datos
      //   - Convertir los videos a HLS (.m3u8 + .ts)
      //   - Generar la estructura necesaria en /videos/
      await this.coursesService.uploadCourse(
        course,
        fullVideo.path,
        previewVideo?.path,
      );

      // 6️⃣ Respuesta exitosa
      return res.status(HttpStatus.CREATED).json({
        message: 'Curso y preview subidos y procesados correctamente',
      });
    } catch (err) {
      // ⚠️ Manejo centralizado de errores (parsing, validación, IO, etc.)
      console.error('Error al subir curso:', err);
      return res.status(400).json({ message: err.message });
    }
  }
}
