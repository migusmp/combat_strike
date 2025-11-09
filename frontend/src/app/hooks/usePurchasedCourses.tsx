import { useAuthContext } from '../context/AuthContext';
import { PurchasedCourse } from '../interfaces/purchases';

type HookState = {
  courses: PurchasedCourse[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<PurchasedCourse[] | null>;
};

/**
 * Hook reutilizable que expone los cursos comprados, precargados desde AuthContext.
 */
export default function usePurchasedCourses(): HookState {
  const {
    purchasedCourses,
    purchasedCoursesLoading,
    purchasedCoursesError,
    refreshPurchasedCourses,
  } = useAuthContext();

  return {
    courses: purchasedCourses,
    isLoading: purchasedCoursesLoading,
    error: purchasedCoursesError,
    refetch: refreshPurchasedCourses,
  };
}
