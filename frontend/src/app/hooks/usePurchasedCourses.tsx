import { useCallback, useEffect, useState } from 'react';
import { PurchasedCourse } from '../interfaces/purchases';

type HookState = {
  courses: PurchasedCourse[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Obtiene los cursos comprados por el usuario autenticado desde `/users/me/courses`.
 */
export default function usePurchasedCourses(): HookState {
  const [courses, setCourses] = useState<PurchasedCourse[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/courses`,
        {
          credentials: 'include',
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setCourses([]);
          return;
        }
        throw new Error('No se pudieron cargar tus cursos');
      }

      const data: PurchasedCourse[] = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const refetch = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  return { courses, isLoading, error, refetch };
}
