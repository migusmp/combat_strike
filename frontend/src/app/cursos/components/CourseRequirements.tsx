import styles from '../css/Course.module.css';

interface CourseRequirementsProps {
    requirements: string[];
}

function CourseRequirements({ requirements }: CourseRequirementsProps) {
    return (
        <section className={styles.courseRequirements}>
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
