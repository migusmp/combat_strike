"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";

const DesktopLayout = dynamic(() => import("./DesktopPurchasedCourseLayout"), { ssr: false });
const MobileLayout = dynamic(() => import("./MobilePurchasedCourseLayout"), { ssr: false });

interface Props {
  course: Course;
  purchase?: PurchasedCourse;
}

export default function PurchasedCourseLayout({ course, purchase }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <MobileLayout course={course} purchase={purchase} />
  ) : (
    <DesktopLayout course={course} purchase={purchase} />
  );
}