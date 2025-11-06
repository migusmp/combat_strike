export type QuickAction = {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    href: string;
};

export type BadgeHighlight = {
    label: string;
    title: string;
    description: string;
    status: string;
};

export type Recommendation = {
    id: string | number;
    title: string;
    description: string;
    meta: string;
    image: string;
    category: string;
    href: string;
};

export type InProgressCourse = {
    id: number;
    title: string;
    category: string;
    progress: number;
    lastLesson: string;
    nextLesson: string;
    image: string;
};

export type RecommendedCourse = {
    id: number;
    title: string;
    duration: string;
    image: string;
};

export type ActivityItem = {
    id: number;
    label: string;
    date: string;
};

export type HeroStat = {
    value: string;
    label: string;
};

export const quickActions: QuickAction[] = [
    {
        eyebrow: "Paso 1",
        title: "Completa tu perfil táctico",
        description: "Ajusta tus intereses, nivel y objetivos para personalizar tus primeras misiones.",
        action: "Personalizar",
        href: "/perfil",
    },
    {
        eyebrow: "Paso 2",
        title: "Configura tu semana",
        description: "Elige los días y horarios donde vas a entrenar para recibir recordatorios.",
        action: "Planificar",
        href: "/agenda",
    },
    {
        eyebrow: "Paso 3",
        title: "Activa alertas de progreso",
        description: "Recibe notificaciones de checkpoints importantes en tu móvil.",
        action: "Activar",
        href: "/ajustes/notificaciones",
    },
];

export const badgeHighlights: BadgeHighlight[] = [
    {
        label: "Insignia en progreso",
        title: "Ritmo Constante",
        description: "Completa 3 días seguidos con check-in táctico.",
        status: "0 / 3 días",
    },
    {
        label: "Objetivo desbloqueable",
        title: "Briefing completado",
        description: "Ve el video inicial y responde al micro cuestionario.",
        status: "0 / 1 misión",
    },
];

export const fallbackRecommendations: Recommendation[] = [
    {
        id: "starter-1",
        title: "Uso Seguro de Sprays de Defensa",
        description: "Perfecto si nunca has utilizado spray en escenarios reales.",
        meta: "45 min · Nivel iniciación",
        image: "/assets/foto-curso-gas-pimienta.png",
        category: "Sprays tácticos",
        href: "/cursos/1",
    },
    {
        id: "starter-2",
        title: "Autoprotección Urbana Esencial",
        description: "Aprende a leer el entorno y a moverte con intención.",
        meta: "1 h 10 min · Nivel iniciación",
        image: "/assets/foto-curso-krav-maga.png",
        category: "Autoprotección",
        href: "/cursos/2",
    },
    {
        id: "starter-3",
        title: "Plan de reacción rápida en casa",
        description: "Sesiones cortas para construir reflejos y agilidad.",
        meta: "30 min · Rutina express",
        image: "/assets/foto-curso-krav-maga-avanzado.png",
        category: "Entrenamiento físico",
        href: "/cursos/3",
    },
];

export const inProgressCourses: InProgressCourse[] = [
    {
        id: 1,
        title: "Defensa Personal Intensiva",
        category: "Krav Maga",
        progress: 68,
        lastLesson: "Bloque 3 · Técnicas de escape",
        nextLesson: "Práctica guiada de respuestas rápidas",
        image: "/assets/foto-curso-krav-maga.png",
    },
    {
        id: 2,
        title: "Uso Seguro de Sprays de Defensa",
        category: "Táctico",
        progress: 42,
        lastLesson: "Mecánica de activación",
        nextLesson: "Simulación en exterior",
        image: "/assets/foto-curso-gas-pimienta.png",
    },
];

export const recommendedCourses: RecommendedCourse[] = [
    {
        id: 3,
        title: "Protocolos de Autoprotección Urbana",
        duration: "1 h 40 min",
        image: "/assets/foto-curso-krav-maga-avanzado.png",
    },
    {
        id: 4,
        title: "Boxeo aplicado a situaciones reales",
        duration: "55 min",
        image: "/assets/foto-curso-krav-maga.png",
    },
];

export const achievements: ActivityItem[] = [
    { id: 1, label: "Rutina semanal completada", date: "Hace 2 días" },
    { id: 2, label: "100% del curso Defensa Personal Femenina", date: "Hace 1 semana" },
    { id: 3, label: "Participaste en el taller presencial", date: "Hace 3 semanas" },
];

export const heroStats: HeroStat[] = [
    { value: "42 h", label: "Tiempo total de práctica" },
    { value: "6", label: "Cursos en progreso" },
    { value: "87%", label: "Compromiso mensual" },
];
