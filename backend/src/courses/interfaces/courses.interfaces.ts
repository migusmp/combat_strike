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
  comment: string;
}

/**
 * Estructura completa de un curso, utilizada para crear o subir cursos nuevos.
 *
 * Incluye tanto los metadatos del curso (nombre, descripción, categoría, etc.)
 * como el contenido detallado (secciones, clases, requisitos, reseñas, etc.).
 *
 * Esta interfaz suele corresponder al payload enviado al backend
 * al registrar o actualizar un curso.
 */
export interface FullCourseData {
  /** Título del curso. */
  title: string;

  /** Descripción breve del curso. */
  description: string;

  /** Descripción extendida o detallada. */
  longDescription: string;

  /** Ruta o URL de la imagen principal del curso. */
  image: string;

  /** Precio del curso (en formato string para incluir decimales). */
  price: string;

  /** Lista de temas o tópicos que aborda el curso. */
  topics: string[];

  /** Categoría a la que pertenece el curso. */
  category: string;

  /** Indica si el curso tiene subtítulos disponibles. */
  isSubtitled: boolean;

  /** Idioma en el que se imparte el curso. */
  language: string;

  /** Indica si el curso es reciente o destacado. */
  isNew: boolean;

  /** Lista de elementos incluidos con el curso (por ejemplo, certificado, acceso de por vida, etc.). */
  includes: string[];

  /** Requisitos previos recomendados para cursarlo. */
  requirements: string[];

  /** Habilidades o conocimientos que el usuario adquirirá al completarlo. */
  whatYouWillLearn: string[];

  /** Estructura del contenido del curso (secciones y clases). */
  content: ContentCourse[];

  /** Reseñas y valoraciones de usuarios. */
  userReviews: UserReviews[];
}
