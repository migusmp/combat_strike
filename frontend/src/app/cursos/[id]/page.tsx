"use client";
import { use } from "react";
import { courses } from "@/lib/mockData";
import ResponsiveCourseLayout from "../components/ResponsiveCourseLayout";

interface CoursePageProps {
    params: Promise<{ id: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
    const { id } = use(params);
    const course = courses.find((c) => c.id === id);

    if (!course) return <h1>Curso no encontrado</h1>;

    return <ResponsiveCourseLayout course={course} />;
}

