interface UserReview {
  name: string;
  comment: string;
  rating: number;
}

export interface SubtitleTrack {
  lang: string;  // ej: "es"
  label: string; // ej: "Español"
  file: string;  // ej: "preview_es.vtt"
}

export interface CourseClass {
  title: string;
  duration: {
    hours: number;
    minutes: number;
  };
  subtitles?: SubtitleTrack[]; // 👈 Subtítulos por clase
}

export interface CourseSection {
  sectionTitle: string;
  classes: CourseClass[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  rating: number;
  reviews: number;
  userReviews: UserReview[];
  updated_at: string;
  created_at: string;
  language: string;
  isSubtitled: boolean;
  image: string;
  price: string;
  includes: string[];
  whatYouWillLearn: string[];
  requirements: string[];

  // 👇 NUEVOS CAMPOS
  previewSubtitles?: SubtitleTrack[]; // Subtítulos del video de preview
  content: CourseSection[];           // Contenido del curso (secciones + clases)
}
