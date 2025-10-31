import { Course } from "@/app/interfaces/courses";

export interface PreviewClip {
    title: string;
    duration: string;
}

const formatDuration = (hours?: number, minutes?: number) => {
    if (!hours && !minutes) return "";
    const parts: string[] = [];
    if (hours && hours > 0) {
        parts.push(`${hours} h`);
    }
    if (minutes !== undefined) {
        parts.push(`${minutes} min`);
    }
    return parts.join(" ").trim();
};

export const buildPreviewClips = (course: Course, limit = 3): PreviewClip[] => {
    const classes = course.content?.flatMap((section) => section.classes) ?? [];
    if (!classes.length) {
        return [];
    }

    return classes.slice(0, limit).map(({ title, duration }) => ({
        title,
        duration: formatDuration(duration?.hours, duration?.minutes),
    }));
};
