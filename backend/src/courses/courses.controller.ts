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
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { CoursesService } from './courses.service';
import { FullCourseData } from './interfaces/courses.interfaces';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    // --- HELPER ---
    private async sendFileIfExists(
        res: Response,
        filePath: string,
        notFoundMessage: string,
    ) {
        try {
            await fsp.access(filePath);
            res.sendFile(filePath);
        } catch {
            throw new NotFoundException(notFoundMessage);
        }
    }

    private getVideoPath(
        courseId: string,
        type: 'preview' | 'full',
        filename: string,
    ) {
        return path.join(process.cwd(), 'videos', courseId, type, filename);
    }

    // --- PREVIEW (abierto) ---
    @Get(':courseId/preview/playlist')
    async getPreviewPlaylist(
        @Param('courseId') courseId: string,
        @Res() res: Response,
    ) {
        const playlistPath = this.getVideoPath(courseId, 'preview', 'preview.m3u8');
        await this.sendFileIfExists(
            res,
            playlistPath,
            'Playlist de preview no encontrada',
        );
    }

    @Get(':courseId/preview/segment/:segment')
    async getPreviewSegment(
        @Param('courseId') courseId: string,
        @Param('segment') segment: string,
        @Res() res: Response,
    ) {
        const segmentPath = this.getVideoPath(courseId, 'preview', segment);
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
        if (!req.user) throw new UnauthorizedException('No autorizado');

        const userId = req.user.id;
        const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
        if (!hasAccess)
            throw new ForbiddenException('No tienes acceso a este curso');

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
        if (!req.user) throw new UnauthorizedException('No autorizado');

        const userId = req.user.id;
        const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
        if (!hasAccess)
            throw new ForbiddenException('No tienes acceso a este curso');

        const segmentPath = this.getVideoPath(courseId, 'full', segment);
        await this.sendFileIfExists(
            res,
            segmentPath,
            'Segmento completo no encontrado',
        );
    }

    // --- FULL COURSE (dividido en secciones y videos) ---
    @Get(':courseId/full/:sectionId/:videoId/playlist')
    async getFullVideoPlaylist(
        @Param('courseId') courseId: string,
        @Param('sectionId') sectionId: string,
        @Param('videoId') videoId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        if (!req.user) throw new UnauthorizedException('No autorizado');

        const userId = req.user.id;
        const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
        if (!hasAccess)
            throw new ForbiddenException('No tienes acceso a este curso');

        const playlistPath = path.join(
            process.cwd(),
            'videos',
            courseId,
            'full',
            sectionId,
            videoId,
            `${videoId}.m3u8`
        );

        await this.sendFileIfExists(
            res,
            playlistPath,
            `Playlist no encontrada para ${sectionId}/${videoId}`,
        );
    }

    @Get(':courseId/full/:sectionId/:videoId/segment/:segment')
    async getFullVideoSegment(
        @Param('courseId') courseId: string,
        @Param('sectionId') sectionId: string,
        @Param('videoId') videoId: string,
        @Param('segment') segment: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        if (!req.user) throw new UnauthorizedException('No autorizado');

        const userId = req.user.id;
        const hasAccess = await this.coursesService.userHasAccess(userId, courseId);
        if (!hasAccess)
            throw new ForbiddenException('No tienes acceso a este curso');

        const segmentPath = path.join(
            process.cwd(),
            'videos',
            courseId,
            'full',
            sectionId,
            videoId,
            segment,
        );

        await this.sendFileIfExists(
            res,
            segmentPath,
            `Segmento no encontrado para ${sectionId}/${videoId}`,
        );
    }

    // --- UPLOAD ZIP ---
    @Post('upload-course-zip')
    @UseInterceptors(
        FileInterceptor('courseZip', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedException('No autorizado');
        }
        const unzip = require('unzipper');
        const extractPath = path.join(process.cwd(), 'uploads', 'tmp', Date.now().toString());

        try {
            await fsp.mkdir(extractPath, { recursive: true });

            await new Promise<void>((resolve, reject) => {
                fs.createReadStream(file.path)
                    .pipe(unzip.Extract({ path: extractPath }))
                    .on('close', resolve)
                    .on('error', reject);
            });

            const courseJsonPath = path.join(extractPath, 'courseData.json');
            const courseData: FullCourseData = JSON.parse(await fsp.readFile(courseJsonPath, 'utf-8'));

            const createdCourse = await this.coursesService.createCourse(courseData);
            const courseId = createdCourse.id;

            const previewPath = path.join(extractPath, 'preview.mp4');
            if (await fsp.access(previewPath).then(() => true).catch(() => false)) {
                await this.coursesService.convertVideoToHLS(courseId, previewPath, 'preview');
            }

            const generatedPlaylists: Array<{ sectionId: string; videoId: string; playlistPath: string }> = [];

            for (const section of courseData.content) {
                const sectionDir = path.join(extractPath, section.sectionTitle);
                if (!(await fsp.access(sectionDir).then(() => true).catch(() => false))) continue;

                for (let i = 0; i < section.classes.length; i++) {
                    const classData = section.classes[i];
                    const videoFileName = `${classData.title}.mp4`;
                    const videoPath = path.join(sectionDir, videoFileName);

                    if (await fsp.access(videoPath).then(() => true).catch(() => false)) {
                        const sectionId = section.sectionTitle.replace(/\s+/g, '-').toLowerCase();
                        const videoId = `video${i + 1}`;
                        const playlistPath = await this.coursesService.convertFullVideoToHLS(
                            courseId,
                            sectionId,
                            videoId,
                            videoPath,
                        );
                        generatedPlaylists.push({ sectionId, videoId, playlistPath });
                    }
                }
            }

            if (generatedPlaylists.length) {
                await this.coursesService.generateFullMasterPlaylist(courseId, generatedPlaylists);
            } else {
                throw new Error('El archivo ZIP no contiene videos completos para el curso.');
            }

            return res.status(HttpStatus.CREATED).json({
                message: 'Curso subido y procesado correctamente',
                courseId,
            });
        } catch (err) {
            console.error('Error al subir curso:', err);
            return res.status(400).json({ message: err.message });
        } finally {
            await fsp.rm(extractPath, { recursive: true, force: true }).catch(() => undefined);
            if (file?.path) {
                await fsp.rm(file.path, { force: true }).catch(() => undefined);
            }
        }
    }

    // --- UPLOAD MANUAL ---
    @Post('upload-course')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'fullVideo', maxCount: 1 },
            { name: 'previewVideo', maxCount: 1 },
        ], {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + path.extname(file.originalname));
                },
            }),
        }),
    )
    async uploadCourse(
        @UploadedFiles() files: { fullVideo?: Express.Multer.File[], previewVideo?: Express.Multer.File[] },
        @Body('courseData') courseData: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedException('No autorizado');
        }

        try {
            const course: FullCourseData = JSON.parse(courseData);

            const fullVideo = files.fullVideo?.[0];
            const previewVideo = files.previewVideo?.[0];

            if (!fullVideo) {
                throw new Error('Falta el video completo');
            }

            await this.coursesService.uploadCourse(
                course,
                fullVideo.path,
                previewVideo?.path,
            );

            return res.status(HttpStatus.CREATED).json({
                message: 'Curso y preview subidos y procesados correctamente',
            });
        } catch (err) {
            console.error('Error al subir curso:', err);
            return res.status(400).json({ message: err.message });
        }
    }
}
