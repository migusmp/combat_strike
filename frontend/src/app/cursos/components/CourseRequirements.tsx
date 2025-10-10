import styles from '../css/Course.module.css';
import stylesLarge from '../css/CourseLarger.module.css'

interface CourseRequirementsProps {
    isReducedScreen?: boolean
    requirements: string[];
}

function CourseRequirements({ requirements, isReducedScreen }: CourseRequirementsProps) {
    const style = isReducedScreen ? stylesLarge : styles
    return (
        <section className={style.courseRequirements}>
            <h2>Requisitos</h2>
            <ul>
                {requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                ))}
            </ul>
        </section>
    );
}

export default CourseRequirements;
