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
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as path from 'path';
import { promises as fs } from 'fs';
import { CoursesService } from './courses.service';
import { FullCourseData } from './interfaces/courses.interfaces';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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
            await fs.access(filePath);
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
        return path.join(__dirname, '../../videos', courseId, type, filename);
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

    @Post('upload-course')
    @UseInterceptors(
        FileInterceptor('video', {
            storage: diskStorage({
                destination: './uploads', // Carpeta temporal donde se guardará el mp4
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + path.extname(file.originalname));
                },
            }),
        }),
    )
    async uploadCourse(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // --- Validación de permisos ---
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedException('No autorizado');
        }

        try {
            // Datos del curso (title, description, etc.)
            const courseData: FullCourseData = req.body as FullCourseData;

            // Subir curso + convertir a HLS
            await this.coursesService.uploadCourse(courseData, file.path);

            return res
                .status(HttpStatus.CREATED)
                .json({ message: 'Curso subido y procesado correctamente' });
        } catch (err) {
            console.error('Error al subir curso:', err);
            return res.status(400).json({ message: err.message });
        }
    }
}
