"use client"; // Componente que se ejecuta solo en el cliente (usa hooks, contextos, etc.)

import { ReactNode } from "react";
import Footer from "../Home/Footer";
import { useAuthContext } from "@/app/context/AuthContext"; // Hook que da acceso al usuario actual
import useCourses from "@/app/hooks/useCourses"; // Hook que obtiene los cursos del backend
import useHomeProgress from "@/app/hooks/useHomeProgress"; // Hook explicado arriba

// 🎨 Estilos distintos para nuevo usuario y usuario con progreso
import newUserStyles from "./css/NewUserHome.module.css";
import loggedStyles from "./css/LoggedHome.module.css";

// 🔧 Componentes de secciones (importados modularmente)
import {
  BadgeHighlightsSection,
  DiscoverySection,
  LoggedHeroSection,
  NewUserHeroSection,
  ProgressSection,
  QuickStartSection,
  RecommendationsSection,
  ActivityFeedSection,
} from "./sections";

// 📦 Contenido de prueba o por defecto
import {
  achievements,
  badgeHighlights,
  fallbackRecommendations,
  heroStats,
  inProgressCourses,
  quickActions,
  recommendedCourses as loggedRecommendations,
  Recommendation,
} from "./data/content";

export default function HomeExperience() {
  // 👤 Usuario autenticado desde el contexto global
  const { user } = useAuthContext();
  const userName = user?.name ?? "Combatiente";

  // 🎓 Cursos del usuario
  const { courses, isLoading, error } = useCourses();

  // 📊 Progreso general (usa el hook anterior)
  const progress = useHomeProgress({ user, courses });

  // 🧩 Construye recomendaciones dinámicamente a partir de los cursos reales
  const recommendedFromApi: Recommendation[] = (courses ?? [])
    .slice(0, 3)
    .map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      meta: course.price ? `${course.price} €` : course.category,
      image: course.image,
      category: course.category,
      href: `/cursos/${course.id}`,
    }));

  // Si no hay cursos reales, usa recomendaciones por defecto
  const discoveryCourses =
    recommendedFromApi.length > 0
      ? recommendedFromApi
      : fallbackRecommendations;

  // Simula un curso en progreso (hasta que haya tracking real)
  const currentCourse = inProgressCourses[0];

  const heroVariant =
    progress.hasActiveCourse || progress.hasPurchasedCourse
      ? "logged"
      : progress.shouldShowQuickStart
      ? "new"
      : null;

  const blocks: ReactNode[] = (
    [
      heroVariant === "new" && (
        <NewUserHeroSection key="hero-new" userName={userName} />
      ),
      heroVariant === "logged" && currentCourse && (
        <LoggedHeroSection
          key="hero-logged"
          userName={userName}
          stats={heroStats}
          currentCourse={currentCourse}
        />
      ),
      progress.shouldShowQuickStart && (
        <QuickStartSection key="quick-start" items={quickActions} />
      ),
      progress.shouldShowBadges && (
        <BadgeHighlightsSection key="badges" badges={badgeHighlights} />
      ),
      progress.shouldShowDiscovery && (
        <DiscoverySection
          key="discovery"
          courses={discoveryCourses}
          isLoading={isLoading}
          error={error}
        />
      ),
      progress.hasActiveCourse && (
        <ProgressSection key="progress" courses={inProgressCourses} />
      ),
      progress.hasPurchasedCourse && (
        <RecommendationsSection
          key="logged-recommendations"
          courses={loggedRecommendations}
        />
      ),
      progress.hasPurchasedCourse && (
        <ActivityFeedSection key="activity" items={achievements} />
      ),
    ] as (ReactNode | false)[]
  ).filter(Boolean) as ReactNode[];

  const hasNewUserStyle = heroVariant === "new";

  return (
    <>
      <div
        className={
          hasNewUserStyle ? newUserStyles.wrapper : loggedStyles.dashboardWrapper
        }
      >
        {blocks}
      </div>
      <Footer />
    </>
  );
}
