/**
 * Custom Hook para obtener la lista de cursos desde el backend.
 *
 * 🔹 Objetivo:
 * Centralizar toda la lógica de carga de cursos (`/courses/get-courses`)
 * en un único lugar, para que componentes como `CoursesSection`, `Carrusel`,
 * o `HomePage` solo tengan que consumir este hook.
 *
 * 🔹 Características:
 * - Usa `fetch` con `credentials: 'include'` para incluir cookies (autenticación JWT).
 * - Gestiona estados de carga (`isLoading`), error (`error`) y datos (`courses`).
 * - Expone una función `refetch()` para volver a obtener los datos manualmente.
 *
 * @returns Un objeto con las siguientes propiedades:
 * ```ts
 * {
 *   courses: Course[] | null; // lista de cursos o null si no se han cargado
 *   isLoading: boolean;       // indica si los cursos están cargándose
 *   error: string | null;     // mensaje de error (si existe)
 *   refetch: () => Promise<void>; // función para volver a cargar los cursos
 * }
 * ```
 *
 * @example
 * ```tsx
 * import useCourses from '@/hooks/useCourses';
 *
 * export default function CoursesSection() {
 *   const { courses, isLoading, error, refetch } = useCourses();
 *
 *   if (isLoading) return <p>Cargando cursos...</p>;
 *   if (error) return <p>Error: {error}</p>;
 *
 *   return (
 *     <div>
 *       <button onClick={refetch}>Recargar</button>
 *       {courses?.map((c) => (
 *         <div key={c.id}>{c.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Course } from '../interfaces/courses';

export default function useCourses() {
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de cursos desde el endpoint `/courses/get-courses`.
   * Utiliza credenciales incluidas (`credentials: 'include'`) para mantener la sesión del usuario.
   */
  const getCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get-courses`, {
        method: 'GET',
        credentials: 'include', // incluir cookies JWT
        cache: 'no-store', // evita usar caché si queremos siempre datos frescos
      });

      if (!res.ok) {
        throw new Error(`Error al obtener cursos: ${res.status} ${res.statusText}`);
      }

      const data: Course[] = await res.json();
      setCourses(data);
      console.log('Courses fetched successfully:', data);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Error desconocido al obtener los cursos');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Hook de efecto: carga los cursos automáticamente al montar el componente.
   */
  useEffect(() => {
    getCourses();
  }, [getCourses]);

  /**
   * Permite volver a cargar los cursos manualmente (por ejemplo, tras actualizar un curso).
   */
  const refetch = useCallback(async () => {
    await getCourses();
  }, [getCourses]);

  // Exponemos los valores y funciones del hook
  return { courses, isLoading, error, refetch };
}