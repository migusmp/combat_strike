"use client";
import { useState } from "react";
import styles from "../css/Course.module.css";
import stylesLarge from "../css/CourseLarger.module.css";

export interface UserReview {
    name: string;
    comment: string;
    rating: number; // 1 a 5
}

interface CourseReviewsProps {
    userReviews: UserReview[];
    isReducedScreen?: boolean;
    max?: number; // cuántas mostrar inicialmente, por defecto 4
}

export default function CourseReviews({ userReviews = [], max = 4, isReducedScreen }: CourseReviewsProps) {
    const style = isReducedScreen ? stylesLarge : styles;
    const [visibleCount, setVisibleCount] = useState(max);

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + max, userReviews.length));
    };

    return (
        <section className={style.courseReviews}>
            <h2>Valoraciones</h2>
            <div className={style.reviewsGrid}>
                {userReviews.slice(0, visibleCount).map((review, idx) => (
                    <div key={idx} className={style.reviewCard}>
                        <p style={{ fontWeight: "bold", color: "#000" }}>{review.name}</p>
                        <p style={{ fontSize: "0.9rem", color: "#888" }}>{review.comment}</p>
                        <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.5rem" }}>
                            {Array.from({ length: 5 }, (_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    fill={i < review.rating ? "gold" : "lightgray"}
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M3.612 15.443c-.396.198-.86-.106-.746-.592l.83-4.73-3.523-3.356c-.329-.314-.158-.888.283-.95l4.898-.696 2.186-4.327c.197-.39.73-.39.927 0l2.186 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.114.486-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón Ver más */}
            {visibleCount < userReviews.length && (
                <button
                    onClick={handleShowMore}
                    className={style.showMoreBtn}
                >
                    Ver más
                </button>
            )}
        </section>
    );
}

