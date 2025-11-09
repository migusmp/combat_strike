// src/courses/courses.module.ts

import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { AuthCookieMiddleware } from './auth-cookie.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesRepository } from './courses.repository';
import { PurchasesModule } from 'src/purchases/purchases.module';

/**
 * Módulo encargado de gestionar toda la funcionalidad relacionada con los cursos.
 *
 * Este módulo agrupa:
 *  - La entidad `Course` (modelo de datos de los cursos)
 *  - El controlador `CoursesController` (maneja las rutas HTTP)
 *  - El servicio `CoursesService` (lógica de negocio)
 *  - El repositorio `CoursesRepository` (acceso a la base de datos)
 *  - El middleware `AuthCookieMiddleware` (protege rutas específicas)
 *
 * Además, importa el `PurchasesModule` para poder usar la lógica de compras dentro del módulo de cursos.
 */
@Module({
  /**
   * `imports`: define las dependencias externas necesarias.
   * 
   * - `TypeOrmModule.forFeature([Course])`: registra la entidad `Course` para que
   *   TypeORM pueda inyectar su repositorio en los servicios y repositorios de este módulo.
   * 
   * - `PurchasesModule`: permite que `CoursesService` acceda a `PurchasesService`
   *   y gestione las compras de cursos desde el propio módulo de cursos.
   */
  imports: [
    TypeOrmModule.forFeature([Course]),
    forwardRef(() => PurchasesModule),
  ],

  /**
   * `controllers`: define los controladores que gestionan las rutas HTTP
   * asociadas a este módulo.
   */
  controllers: [CoursesController],

  /**
   * `providers`: registra los servicios y repositorios internos que
   * contienen la lógica de negocio y de persistencia.
   */
  providers: [CoursesService, CoursesRepository],
  exports: [CoursesService, TypeOrmModule], // útil si luego lo usas en otros módulos
})
export class CoursesModule {
  /**
   * Configura los middlewares que deben aplicarse a rutas específicas del módulo.
   *
   * En este caso, se aplica `AuthCookieMiddleware`, que valida la cookie de autenticación
   * y extrae el usuario del token JWT antes de permitir el acceso a las rutas protegidas.
   *
   * Solo las rutas listadas estarán protegidas, evitando aplicar el middleware globalmente.
   *
   * @param consumer - Permite configurar middlewares específicos para rutas concretas.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCookieMiddleware).forRoutes(
      // ✅ Rutas que requieren autenticación para acceder al contenido completo del curso
      { path: 'courses/:courseId/full/playlist', method: RequestMethod.GET },
      {
        path: 'courses/:courseId/full/:sectionId/:videoId/playlist',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/full/:sectionId/:videoId/segment/:segment',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/full/:sectionId/:videoId/subtitles/:filename',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/full/segment/:segment',
        method: RequestMethod.GET,
      },

      // ✅ Rutas que requieren autenticación de administrador (subida de cursos)
      { path: 'courses/upload-course', method: RequestMethod.POST },
      { path: 'courses/upload-course-zip', method: RequestMethod.POST },

      // ✅ Ruta protegida de compra de cursos (requiere usuario autenticado)
      { path: 'courses/buy/:courseId', method: RequestMethod.POST },
    );
  }
}
