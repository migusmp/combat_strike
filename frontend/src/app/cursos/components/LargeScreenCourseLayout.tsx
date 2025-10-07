import { Course } from "../interfaces/interfaces";
import stylesLarge from '../css/CourseLarger.module.css'
import styles from '../css/Course.module.css'
import Image from "next/image";
import Footer from "@/app/components/Home/Footer";

interface DesktopCourseLayoutProps {
    course: Course; // Aquí podrías usar tu tipo Course
    isSticky: boolean;
    setShowShare: (val: boolean) => void;
}

export default function LargeScreenCourseLayout({ course, isSticky, setShowShare }: DesktopCourseLayoutProps) {
    return (
        <>

            <main className={stylesLarge.container}>
                <section>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={course.image}
                            alt={course.title}
                            width={390}
                            height={200}
                            className={styles.courseImage}
                            style={{ border: "1px solid #1e1e1e" }}
                        />
                        <div className={styles.overlay}>
                            <button className={styles.startButton}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-play-circle-fill"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                                </svg>
                            </button>
                            <p className={styles.previewText}>Vista previa del curso</p>
                        </div>
                    </div>

                    <h1 className={stylesLarge.courseTitle}>{course.title}</h1>
                    <p className={stylesLarge.courseDescription}>{course.description}</p>

                    <section className={stylesLarge.courseExtraInfo}>
                        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-octagon" viewBox="0 0 16 16">
                            <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z" />
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                        </svg>Última actualización: {course.updated_at}</p>
                        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-translate" viewBox="0 0 16 16">
                            <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
                            <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
                        </svg> {course.language}</p>
                        {course.isSubtitled && <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-badge-cc" viewBox="0 0 16 16">
                            <path d="M3.708 7.755c0-1.111.488-1.753 1.319-1.753.681 0 1.138.47 1.186 1.107H7.36V7c-.052-1.186-1.024-2-2.342-2C3.414 5 2.5 6.05 2.5 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114H6.213c-.048.615-.496 1.05-1.186 1.05-.84 0-1.319-.62-1.319-1.727zm6.14 0c0-1.111.488-1.753 1.318-1.753.682 0 1.139.47 1.187 1.107H13.5V7c-.053-1.186-1.024-2-2.342-2C9.554 5 8.64 6.05 8.64 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114h-1.147c-.048.615-.497 1.05-1.187 1.05-.839 0-1.318-.62-1.318-1.727z" />
                            <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                        </svg>Español [automático]</p>}
                    </section>

                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        {course.reviews && course.reviews > 0 ? (
                            <>
                                {Array.from({ length: 5 }, (_, i) => {
                                    const starValue = i + 1;
                                    return (
                                        <svg
                                            key={i}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill={starValue <= Math.round(course.rating) ? "gold" : "lightgray"}
                                            viewBox="0 0 16 16"
                                            style={{ verticalAlign: "middle", display: "block" }}
                                        >
                                            <path d="M3.612 15.443c-.396.198-.86-.106-.746-.592l.83-4.73-3.523-3.356c-.329-.314-.158-.888.283-.95l4.898-.696 2.186-4.327c.197-.39.73-.39.927 0l2.186 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.114.486-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                                        </svg>
                                    );
                                })}
                                <span style={{ color: "#888", fontWeight: "bold", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                                    {course.rating.toFixed(1)}
                                </span>
                                <span style={{ color: "#888", fontSize: "0.875rem", marginLeft: "0.4rem" }}>
                                    ({course.reviews} valoraciones)
                                </span>
                            </>
                        ) : (
                            <span style={{ color: "#888", fontSize: "0.875rem" }}>
                                No hay valoraciones
                            </span>
                        )}
                    </span>

                    <div className={stylesLarge.buyCourseDiv}>
                        <p className={stylesLarge.coursePrice}>{course.price} €</p>
                        <button className={stylesLarge.buyCourseButton}>Comprar ahora</button>
                        <p className={stylesLarge.accessLifetime}>Acceso de por vida</p>
                    </div>

                </section>

            </main>
            <Footer />
        </>
    );
}
