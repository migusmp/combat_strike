import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Repositorio responsable de manejar las operaciones de acceso a datos
 * relacionadas con los cursos (`Course`).
 *
 * Este repositorio encapsula la interacción con TypeORM y con el sistema
 * de archivos (para gestionar los vídeos y recursos asociados a los cursos).
 *
 * Forma parte del patrón **Repository**, separando la lógica de persistencia
 * de la lógica de negocio que reside en `CoursesService`.
 */
@Injectable()
export class CoursesRepository {
  /**
   * Inyecta el repositorio de TypeORM correspondiente a la entidad `Course`.
   *
   * @param repo - Instancia de `Repository<Course>` proporcionada por TypeORM.
   */
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  // -------------------------------------------------
  // 📦 Crear o subir curso
  // -------------------------------------------------

  /**
   * Crea y guarda un nuevo curso en la base de datos.
   *
   * Este método recibe un objeto parcial con los datos del curso
   * (título, descripción, precio, etc.) y crea una nueva entidad
   * `Course` que luego se persiste.
   *
   * @param courseData - Datos parciales del curso (sin necesidad de todos los campos).
   * @returns La entidad `Course` recién creada y guardada.
   *
   * @example
   * ```ts
   * const nuevoCurso = await coursesRepository.uploadCourse({
   *   title: 'Krav Maga Básico',
   *   description: 'Curso de defensa personal',
   *   price: 59.99,
   * });
   * ```
   */
  async uploadCourse(courseData: Partial<Course>) {
    const course = this.repo.create(courseData);
    return this.repo.save(course);
  }

  // -------------------------------------------------
  // 🔍 Buscar curso por ID
  // -------------------------------------------------

  /**
   * Busca un curso en la base de datos por su ID.
   *
   * @param id - Identificador numérico del curso.
   * @returns El curso si existe, o `null` si no se encuentra.
   *
   * @example
   * ```ts
   * const curso = await coursesRepository.findCourseById(3);
   * if (!curso) throw new NotFoundException('Curso no encontrado');
   * ```
   */
  async findCourseById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  // -------------------------------------------------
  // 🗑️ Eliminar curso
  // -------------------------------------------------

  /**
   * Elimina un curso tanto de la base de datos como del sistema de archivos.
   *
   * Este método:
   * 1️⃣ Verifica que el curso exista en la base de datos.  
   * 2️⃣ Lo elimina mediante TypeORM.  
   * 3️⃣ Intenta borrar la carpeta asociada al curso en el disco (`/videos/:id`).
   *
   * Si los archivos no existen o hay un error al eliminarlos, se muestra
   * una advertencia sin interrumpir la ejecución.
   *
   * @param id - ID del curso que se desea eliminar.
   * @returns Un objeto con un mensaje de confirmación.
   *
   * @throws `NotFoundException` si el curso no existe.
   *
   * @example
   * ```ts
   * const result = await coursesRepository.deleteCourse(7);
   * console.log(result.message); // "Curso eliminado correctamente"
   * ```
   */
  async deleteCourse(id: number) {
    // 1️⃣ Verificar si el curso existe
    const course = await this.findCourseById(id);
    if (!course) throw new NotFoundException('Curso no encontrado');

    // 2️⃣ Eliminar el registro de la base de datos
    await this.repo.delete(id);

    // 3️⃣ Eliminar los archivos asociados del sistema de archivos
    const courseDir = path.join(process.cwd(), 'videos', String(id));
    try {
      await fs.rm(courseDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`No se pudieron borrar los archivos del curso ${id}:`, err);
    }

    // 4️⃣ Devolver respuesta informativa
    return { message: 'Curso eliminado correctamente' };
  }
}
