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

    async uploadCourse(courseData: FullCourseData, videoPath: string) {
        console.log('DATA DEL CURSO:', courseData);
        console.log('VIDEO PATH:', videoPath);

        // 1️⃣ Guardar el curso en la base de datos
        const newCourse = await this.courseRepository.uploadCourse(courseData);

        // 2️⃣ Convertir el video a HLS
        await this.convertVideoToHLS(newCourse.id, videoPath);
    }

    async convertVideoToHLS(courseId: string, inputPath: string) {
        const outputDir = path.join(__dirname, '../../videos', courseId, 'full');
        await fs.mkdir(outputDir, { recursive: true });

        return new Promise<void>((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls',
                ])
                .output(path.join(outputDir, 'full.m3u8'))
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });
    }
}
