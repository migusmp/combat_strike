"use client";
import Link from "next/link";
import styles from "../../css/CoursesSection.module.css";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  topics: string[];
  price: string;
  photo: string;
}

export default function CourseCard({ id, title, topics, price, photo }: CourseCardProps) {
  return (
    <Link href={`/cursos/${id}`} className={styles.courseCard}>
      <div className={styles.courseImage}>
        <Image
          src={photo}
          alt={title}
          width={400}
          height={200}
          className={styles.image}
        />
      </div>
      <h3 className={styles.courseTitle}>{title}</h3>
      <ul className={styles.courseTopics}>
        {topics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
      <div className={styles.coursePrice}>{price}</div>
    </Link>
  );
}