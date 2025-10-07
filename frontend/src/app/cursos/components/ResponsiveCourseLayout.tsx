"use client";
import { useState, useEffect } from "react";
import { Course } from '../interfaces/interfaces'
import DesktopCourseLayout from "./DesktopCourseLayout";
import LargeScreenCourseLayout from "./LargeScreenCourseLayout";

interface ResponsiveCourseLayoutProps {
    course: Course;
}

export default function ResponsiveCourseLayout({ course }: ResponsiveCourseLayoutProps) {
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [showShare, setShowShare] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);

        // Comprobación inicial
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Aquí ponemos el breakpoint 1253px
    if (windowWidth <= 1000) {
        return <LargeScreenCourseLayout course={course} isSticky={isSticky} setShowShare={setShowShare} />;
    } else {
        return <DesktopCourseLayout course={course} showShare={showShare} isSticky={isSticky} setShowShare={setShowShare} />;
    }
}

