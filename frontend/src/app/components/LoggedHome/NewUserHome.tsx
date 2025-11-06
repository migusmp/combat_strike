"use client";

import Footer from "../Home/Footer";
import styles from "./css/NewUserHome.module.css";
import { useAuthContext } from "@/app/context/AuthContext";
import useCourses from "@/app/hooks/useCourses";
import {
    quickActions,
    badgeHighlights,
    fallbackRecommendations,
    Recommendation,
} from "./data/content";
import {
    BadgeHighlightsSection,
    DiscoverySection,
    NewUserHeroSection,
    QuickStartSection,
} from "./sections";

export default function NewUserHome() {
    const { user } = useAuthContext();
    const userName = user?.name ?? "Combatiente";
    const { courses, isLoading: coursesLoading, error: coursesError } = useCourses();

    const recommendedFromApi: Recommendation[] = (courses ?? []).slice(0, 3).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        meta: course.price ? `${course.price} €` : course.category,
        image: course.image,
        category: course.category,
        href: `/cursos/${course.id}`,
    }));

    const recommendedCourses =
        recommendedFromApi.length > 0 ? recommendedFromApi : fallbackRecommendations;

    return (
        <>
            <div className={styles.wrapper}>
                <NewUserHeroSection userName={userName} />
                <QuickStartSection items={quickActions} />
                <BadgeHighlightsSection badges={badgeHighlights} />
                <DiscoverySection
                    courses={recommendedCourses}
                    isLoading={coursesLoading}
                    error={coursesError}
                />
            </div>
            <Footer />
        </>
    );
}
