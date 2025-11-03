// src/courses/course.entity.ts

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentCourse, UserReviews } from '../interfaces/courses.interfaces';

/**
 * Entidad que representa un curso dentro del sistema.
 *
 * Esta clase mapea la tabla `courses` en la base de datos y define
 * toda la información que compone un curso publicado en la plataforma.
 *
 * Los cursos incluyen información descriptiva, multimedia, de contenido,
 * y también datos agregados como valoraciones y reseñas de usuarios.
 */
@Entity('courses')
export class Course {
  /**
   * Identificador único del curso.
   *
   * Se genera automáticamente de forma incremental.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Título del curso.
   *
   * Representa el nombre principal mostrado al usuario.
   */
  @Column()
  title: string;

  /**
   * Descripción corta del curso.
   *
   * Ideal para mostrar en tarjetas, listados o vistas previas.
   */
  @Column({ type: 'text' })
  description: string;

  /**
   * Descripción extendida del curso.
   *
   * Contiene información detallada del contenido, objetivos y metodología.
   */
  @Column({ type: 'text', nullable: true })
  longDescription?: string;

  /**
   * URL o ruta de la imagen asociada al curso.
   *
   * Normalmente se usa para mostrar una miniatura o portada del curso.
   */
  @Column({ nullable: true })
  image?: string;

  /**
   * Precio del curso (almacenado como string para permitir formatos tipo "59.99").
   */
  @Column()
  price: string;

  /**
   * Lista de temas o tópicos cubiertos por el curso.
   *
   * Se almacena como un array simple en la base de datos.
   * Ejemplo: `['Defensas básicas', 'Técnicas de ataque', 'Simulaciones']`
   */
  @Column({ type: 'simple-array', nullable: true })
  topics?: string[];

  /**
   * Categoría principal del curso.
   *
   * Ejemplo: `"Defensa Personal"`, `"Programación"`, `"Nutrición"`, etc.
   */
  @Column()
  category: string;

  /**
   * Indica si el curso incluye subtítulos.
   *
   * Por defecto, es `true`.
   */
  @Column({ default: true })
  isSubtitled: boolean;

  /**
   * Idioma en el que se imparte el curso.
   *
   * Ejemplo: `"Español"`, `"Inglés"`, `"Francés"`.
   */
  @Column({ nullable: true })
  language?: string;

  /**
   * Indica si el curso es nuevo o recientemente añadido.
   *
   * Puede usarse para destacar cursos recientes en la interfaz.
   */
  @Column({ default: false })
  isNew: boolean;

  /**
   * Elementos que el curso incluye.
   *
   * Ejemplo: `['Acceso de por vida', 'Certificado de finalización']`.
   */
  @Column({ type: 'simple-array', nullable: true })
  includes?: string[];

  /**
   * Requisitos previos recomendados para tomar el curso.
   *
   * Ejemplo: `['Conocimientos básicos de defensa', 'Motivación para aprender']`.
   */
  @Column({ type: 'simple-array', nullable: true })
  requirements?: string[];

  /**
   * Lista de aprendizajes o habilidades que el alumno obtendrá al finalizar.
   *
   * Ejemplo: `['Defenderte en situaciones reales', 'Mejorar tu condición física']`.
   */
  @Column({ type: 'simple-array', nullable: true })
  whatYouWillLearn?: string[];

  /**
   * Subtítulos disponibles para el video de previsualización del curso.
   *
   * Este campo permite ofrecer soporte multilenguaje en los videos de vista previa,
   * facilitando la accesibilidad y el entendimiento para usuarios de distintos idiomas.
   *
   * Se almacena como un array de objetos JSON, donde cada objeto define:
   * - `lang`: código o identificador del idioma (por ejemplo, `"es"`, `"en"`, `"fr"`).
   * - `label`: nombre visible del idioma (por ejemplo, `"Español"`, `"English"`).
   * - `file`: nombre del archivo `.vtt` correspondiente al idioma (por ejemplo, `"preview_es.vtt"`).
   *
   * Ejemplo:
   * ```json
   * [
   *   { "lang": "es", "label": "Español", "file": "preview_es.vtt" },
   *   { "lang": "en", "label": "English", "file": "preview_en.vtt" }
   * ]
   * ```
   *
   * El archivo `.vtt` debe estar disponible en la carpeta del curso,
   * dentro de la subcarpeta `/preview/subtitles/`.
   */
  @Column({ type: 'json', nullable: true })
  previewSubtitles?: Array<{ lang: string; label: string; file: string }>;

  /**
   * Contenido estructurado del curso.
   *
   * Este campo almacena un array de secciones, cada una con sus vídeos y metadatos.
   * Se guarda en formato JSON.
   */
  @Column({ type: 'json', nullable: true })
  content?: ContentCourse[];

  /**
   * Valoración media del curso.
   *
   * Se calcula a partir de las reseñas de los usuarios.
   * Por defecto, empieza en 0.
   */
  @Column({ type: 'float', default: 0 })
  rating: number;

  /**
   * Número total de reseñas o valoraciones recibidas.
   */
  @Column({ default: 0 })
  reviews: number;

  /**
   * Reseñas de usuarios almacenadas en formato JSON.
   *
   * Cada reseña puede incluir información como:
   * - `userName`
   * - `comment`
   * - `rating`
   */
  @Column({ type: 'json', nullable: true })
  userReviews?: UserReviews[];

  /**
   * Fecha de creación del curso.
   *
   * Se asigna automáticamente al insertar el registro.
   */
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  /**
   * Fecha de última actualización del curso.
   *
   * Se actualiza automáticamente cuando el registro es modificado.
   */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
