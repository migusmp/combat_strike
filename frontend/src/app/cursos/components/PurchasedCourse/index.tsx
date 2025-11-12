"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";

const DesktopLayout = dynamic(() => import("./DesktopPurchasedCourseLayout"), { ssr: false });
const MobileLayout = dynamic(() => import("./MobilePurchasedCourseLayout"), { ssr: false });

interface Props {
  course: Course;
  purchase?: PurchasedCourse;
}

/** Pequeño debounce sin dependencias */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 150) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Hook: isMobile con debounce en resize */
function useDebouncedIsMobile(breakpoint = 768, wait = 150) {
  const get = () => (typeof window !== "undefined" ? window.innerWidth <= breakpoint : false);
  const [isMobile, setIsMobile] = useState<boolean>(get);

  useEffect(() => {
    const onResize = debounce(() => setIsMobile(get()), wait);
    // set inicial por si acaso
    setIsMobile(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [wait, breakpoint]);

  return isMobile;
}

export default function PurchasedCourseLayout({ course, purchase }: Props) {
  const isMobile = useDebouncedIsMobile(768, 150);

  // (Opcional) Evita hacer flip-flop si está justo en el umbral
  const layout = useMemo(() => (isMobile ? "mobile" : "desktop"), [isMobile]);

  return layout === "mobile" ? (
    <MobileLayout course={course} purchase={purchase} />
  ) : (
    <DesktopLayout course={course} purchase={purchase} />
  );
}
