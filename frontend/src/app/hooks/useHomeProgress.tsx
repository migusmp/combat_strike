"use client";

import { useEffect, useMemo, useState } from "react";
import { Course } from "../interfaces/courses";
import { AuthUser } from "../interfaces/user";

// 🔑 Clave base en localStorage para guardar progreso de onboarding por usuario.
const QUICK_START_KEY = "combat_strike.quick_start";

type Params = {
  user: AuthUser | null; // Usuario autenticado (o null si no hay sesión)
  courses: Course[] | null | undefined; // Cursos del usuario (puede ser null/undefined mientras carga)
};

// 📘 Estructura del estado de progreso en la pantalla principal
export type HomeProgressState = {
  hasPurchasedCourse: boolean; // Si el usuario ha comprado algún curso
  hasActiveCourse: boolean; // Si tiene un curso en progreso (por ahora igual a hasPurchasedCourse)
  completedQuickStart: boolean; // Si completó el recorrido inicial (tutorial o briefing)
  shouldShowQuickStart: boolean; // Si debe mostrarse la sección de inicio rápido
  shouldShowBadges: boolean; // Si deben mostrarse insignias de bienvenida
  shouldShowDiscovery: boolean; // Si deben mostrarse recomendaciones o exploración
};

export default function useHomeProgress({
  user,
  courses,
}: Params): HomeProgressState {
  // 🧩 Estado interno: indica si el usuario ya completó el "Quick Start"
  const [quickStartCompleted, setQuickStartCompleted] = useState(false);

  useEffect(() => {
    // ⚙️ Efecto que se ejecuta cuando cambia el usuario activo
    // Lee desde localStorage si el usuario ya completó el inicio rápido.
    if (typeof window === "undefined" || !user?.id) return;
    const stored = window.localStorage.getItem(`${QUICK_START_KEY}:${user.id}`);
    setQuickStartCompleted(stored === "true");
  }, [user?.id]);

  // ✅ Determina si el usuario ha comprado algún curso (por ahora solo revisa la lista)
  const hasPurchasedCourse = (courses?.length ?? 0) > 0;

  // ⚠️ Temporalmente, se asume que si tiene cursos comprados, también tiene uno activo.
  // TODO: reemplazar por un flag real del backend cuando tengamos seguimiento de progreso.
  const hasActiveCourse = hasPurchasedCourse;

  // 🧠 Devuelve un objeto memoizado con el estado calculado.
  // Solo se recalcula cuando cambian las dependencias relevantes.
  return useMemo(
    () => ({
      hasPurchasedCourse,
      hasActiveCourse,
      completedQuickStart: quickStartCompleted,
      shouldShowQuickStart: !quickStartCompleted, // muestra QuickStart si no está completo
      shouldShowBadges: !quickStartCompleted, // muestra insignias si no completó inicio rápido
      shouldShowDiscovery: !hasActiveCourse, // solo se muestra si aún no tiene curso activo
    }),
    [hasPurchasedCourse, hasActiveCourse, quickStartCompleted]
  );
}
