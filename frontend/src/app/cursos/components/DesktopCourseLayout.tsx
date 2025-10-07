"use client";

import styles from "../css/Course.module.css";
import CourseHeader from "../components/CourseHeader";
import CourseVideoIntroduction from "../components/CourseVideoIntroduction";
import WhatYouWillLearn from "../components/WhatYouWillLearnSection";
import CourseContent from "../components/CourseContent";
import CourseRequirements from "../components/CourseRequirements";
import CourseDescription from "../components/CourseDescription";
import CourseReviews from "../components/CourseReviews";
import ShareModal from "../components/ShareModal";
import { Course } from "../interfaces/interfaces";
import Footer from "@/app/components/Home/Footer";

interface DesktopCourseLayoutProps {
    course: Course; // Aquí podrías usar tu tipo Course
    isSticky: boolean;
    showShare: boolean;
    setShowShare: (val: boolean) => void;
}

export default function DesktopCourseLayout({ course, isSticky, setShowShare, showShare }: DesktopCourseLayoutProps) {
    return (
        <>
            <main className={styles.courseContainer}>
                <section className={styles.coursePresentation}>
                    <CourseHeader course={course} />
                    <CourseVideoIntroduction course={course} isSticky={isSticky} setShowShare={setShowShare} />
                </section>

                <WhatYouWillLearn points={course.whatYouWillLearn} />
                <CourseContent courseId={course.id} />
                <CourseRequirements requirements={course.requirements} />
                <CourseDescription text={course.longDescription} maxLength={250} />

                {showShare && (
                    <ShareModal
                        url={`${process.env.NEXT_PUBLIC_URL}/cursos/${course.id}`}
                        onClose={() => setShowShare(false)}
                    />
                )}

                <CourseReviews userReviews={course.userReviews} />
            </main>

            <Footer />
        </>
    );
}

