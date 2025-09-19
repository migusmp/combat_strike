import styles from '../css/LoggedHome.module.css';

export default function UserMenu() {
    return <section className={styles.usermenu}>
        <ul>
            <li>Cuenta</li>
            <li>Mis Cursos</li>
            <li>Cerrar sesión</li>
        </ul>
    </section>
}
