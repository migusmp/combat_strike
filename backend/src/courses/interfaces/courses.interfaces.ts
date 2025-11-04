/**
 * Representa una clase individual dentro de una sección del curso.
 *
 * Cada clase tiene un título y una duración expresada en horas y minutos.
 */
export interface Classes {
  /** Título de la clase. Ejemplo: "Introducción al curso" */
  title: string;

  /** Duración estimada de la clase en formato { horas, minutos }. */
  duration: {
    /** Número de horas que dura la clase. */
    hours: number;

    /** Número de minutos adicionales (0–59). */
    minutes: number;
  };
  subtitle?: PreviewSubtitle[];
}

/**
 * Representa una sección del curso (un conjunto de clases relacionadas).
 *
 * Un curso puede estar compuesto por múltiples secciones, cada una
 * agrupando varias clases individuales.
 */
export interface ContentCourse {
  /** Título de la sección. Ejemplo: "Fundamentos básicos del Krav Maga" */
  sectionTitle: string;

  /** Lista de clases incluidas dentro de esta sección. */
  classes: Classes[];
}

/**
 * Representa una reseña o valoración hecha por un usuario sobre un curso.
 */
export interface UserReviews {
  /** Nombre del usuario que realizó la reseña. */
  name: string;

  /** Calificación numérica otorgada por el usuario (por ejemplo, de 1 a 5). */
  rating: number;

  /** Comentario opcional escrito por el usuario. */
  comment?: string;
}

/**
 * Representa un subtítulo disponible para el video de previsualización del curso.
 */
export interface PreviewSubtitle {
  /** Código o identificador del idioma (por ejemplo, "es", "en"). */
  lang: string;

  /** Nombre visible del idioma (por ejemplo, "Español", "English"). */
  label: string;

  /** Nombre del archivo `.vtt` asociado a este idioma. */
  file: string;
}

/**
 * Estructura completa de un curso, utilizada tanto para crear, como para obtener
 * o actualizar información detallada de un curso en el sistema.
 *
 * Esta interfaz está alineada con la entidad `Course` de la base de datos.
 */
export interface FullCourseData {
  /** Identificador único del curso. */
  id?: number;

  /** Título del curso. */
  title: string;

  /** Descripción breve del curso. */
  description: string;

  /** Descripción extendida o detallada. */
  longDescription?: string;

  /** Ruta o URL de la imagen principal del curso. */
  image?: string;

  /** Precio del curso (en formato string para incluir decimales). */
  price: string;

  /** Lista de temas o tópicos que aborda el curso. */
  topics?: string[];

  /** Categoría a la que pertenece el curso. */
  category: string;

  /** Indica si el curso tiene subtítulos disponibles. */
  isSubtitled: boolean;

  /** Idioma en el que se imparte el curso. */
  language?: string;

  /** Indica si el curso es reciente o destacado. */
  isNew: boolean;

  /** Lista de elementos incluidos con el curso (por ejemplo, certificado, acceso de por vida, etc.). */
  includes?: string[];

  /** Requisitos previos recomendados para cursarlo. */
  requirements?: string[];

  /** Habilidades o conocimientos que el usuario adquirirá al completarlo. */
  whatYouWillLearn?: string[];

  /** Subtítulos disponibles para el video de previsualización del curso. */
  previewSubtitles?: PreviewSubtitle[];

  /** Estructura del contenido del curso (secciones y clases). */
  content?: ContentCourse[];

  /** Valoración media del curso. */
  rating: number;

  /** Número total de reseñas recibidas. */
  reviews: number;

  /** Reseñas y valoraciones de usuarios. */
  userReviews?: UserReviews[];

  /** Fecha de creación del curso (generada automáticamente por la base de datos). */
  created_at?: Date;

  /** Fecha de última actualización del curso (generada automáticamente por la base de datos). */
  updated_at?: Date;
}