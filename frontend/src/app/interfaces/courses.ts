/**
 * Representa la duración de una clase (en horas y minutos).
 */
export interface Duration {
  /** Horas de duración (ej: 1) */
  hours: number;
  /** Minutos de duración (ej: 30) */
  minutes: number;
}

/**
 * Representa un archivo de subtítulos (.vtt) asociado a un video.
 */
export interface SubtitleTrack {
  /** Código del idioma (ej: "es", "en") */
  lang: string;
  /** Nombre legible del idioma (ej: "Español", "English") */
  label: string;
  /** Nombre del archivo o ruta relativa al .vtt */
  file: string;
}

/**
 * Representa una clase individual dentro de una sección del curso.
 */
export interface Classes {
  /** Título descriptivo de la clase */
  title: string;
  /** Duración estimada de la clase */
  duration: Duration;

  /** Lista de subtítulos disponibles para esta clase */
  subtitles?: SubtitleTrack[];
}

/**
 * Representa una sección dentro del contenido del curso.
 *
 * Cada sección agrupa un conjunto de clases relacionadas.
 */
export interface ContentSection {
  /** Título de la sección (ej: "Fundamentos", "Simulaciones") */
  sectionTitle: string;
  /** Lista de clases incluidas dentro de la sección */
  classes: Classes[];
}

/**
 * Representa una reseña escrita por un usuario sobre el curso.
 */
export interface UserReview {
  /** Nombre del usuario que deja la reseña */
  name: string;
  /** Puntuación dada por el usuario (1 a 5) */
  rating: number;
  /** Comentario opcional del usuario */
  comment: string;
}

/**
 * Interfaz principal que describe un curso completo disponible en la plataforma.
 */
export interface Course {
  /** Identificador único del curso (slug o ID corto, ej: "krav-maga") */
  id: number;

  /** Título del curso mostrado al usuario */
  title: string;

  /** Descripción breve (para vistas previas o tarjetas) */
  description: string;

  /** Descripción extendida con más detalles sobre el curso */
  longDescription: string;

  /** Ruta o URL de la imagen asociada al curso */
  image: string;

  /** Precio del curso en formato string (ej: "59,99") */
  price: string;

  /** Lista de temas o tópicos principales que abarca el curso */
  topics: string[];

  /** Fecha de última actualización del curso (formato YYYY-MM-DD o ISO) */
  updated_at: string;

  /** Fecha de creación del curso (formato YYYY-MM-DD o ISO) */
  created_at: string;

  /** Indica si el curso incluye subtítulos */
  isSubtitled: boolean;

  /** Idioma principal del curso (ej: "Español") */
  language: string;

  /** Indica si el curso es nuevo (destacado como reciente) */
  isNew: boolean;

  /** Categoría principal del curso (ej: "Defensa Personal", "Sprays") */
  category: string;

  /** Lista de elementos incluidos con la compra del curso */
  includes: string[];

  /** Requisitos previos recomendados para realizar el curso */
  requirements: string[];

  /** Habilidades o aprendizajes que el estudiante obtendrá */
  whatYouWillLearn: string[];

  /** Estructura del contenido del curso (secciones y clases) */
  content: ContentSection[];

  /** Valoración promedio del curso (de 0 a 5) */
  rating: number;

  /** Número total de reseñas recibidas */
  reviews: number;

  /** Reseñas de los usuarios que han realizado el curso */
  userReviews: UserReview[];

  /** 🔹 Subtítulos del video de preview (ej: Español, Inglés, etc.) */
  previewSubtitles?: SubtitleTrack[];
}
