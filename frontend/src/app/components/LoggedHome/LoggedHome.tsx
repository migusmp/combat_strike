// components/LoggedHome.tsx
import Footer from "../Home/Footer";
import styles from "./css/LoggedHome.module.css";
import { useAuthContext } from "@/app/context/AuthContext";
import {
    achievements,
    heroStats,
    inProgressCourses,
    recommendedCourses,
} from "./data/content";
import {
    ActivityFeedSection,
    LoggedHeroSection,
    ProgressSection,
    RecommendationsSection,
} from "./sections";

export default function LoggedHome() {
    const { user } = useAuthContext();
    const userName = user?.name ?? "Combatiente";
    const currentCourse = inProgressCourses[0];

    return (
        <>
            <div className={styles.dashboardWrapper}>
                <LoggedHeroSection userName={userName} stats={heroStats} currentCourse={currentCourse} />
                <ProgressSection courses={inProgressCourses} />
                <RecommendationsSection courses={recommendedCourses} />
                <ActivityFeedSection items={achievements} />
            </div>
            <Footer />
        </>
    );
}
