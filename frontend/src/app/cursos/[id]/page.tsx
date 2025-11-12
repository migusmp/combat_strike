"use client";

import { useParams } from "next/navigation";
import useCourses from "@/app/hooks/useCourses";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "@/app/css/Cursos.module.css";
import ResponsiveCourseLayout from "../components/ResponsiveCourseLayout";
import { useAuthContext } from "@/app/context/AuthContext";
import PurchasedCourseLayout from "../components/PurchasedCourse";

export default function CoursePage() {
    const { id } = useParams<{ id: string }>();
    const { courses, isLoading, error } = useCourses();
    const { isAuthenticated, purchasedCourses, purchasedCoursesLoading } = useAuthContext();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <p className={styles.error}>Error: {error}</p>;
    if (!courses || courses.length === 0)
        return <p className={styles.empty}>No hay cursos disponibles.</p>;

    const courseId = Number(id);
    const course = courses.find((c) => c.id === courseId);


    if (!course)
        return (
            <p className={styles.error}>
                No se encontró el curso con el id: <strong>{id}</strong>
            </p>
        );

    const ownedPurchase =
        isAuthenticated && purchasedCourses
            ? purchasedCourses.find((purchase) => purchase.course?.id === course.id)
            : null;

    if (isAuthenticated && purchasedCoursesLoading) {
        return <LoadingSpinner />;
    }

    if (ownedPurchase) {
        return <PurchasedCourseLayout course={course} purchase={ownedPurchase} />;
    }

    return <ResponsiveCourseLayout course={course} />;
}
