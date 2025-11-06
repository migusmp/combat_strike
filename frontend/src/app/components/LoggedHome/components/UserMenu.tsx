// components/UserMenu.tsx
import { forwardRef } from "react";
import styles from "../css/LoggedHome.module.css";
import { API_URL } from "@/app/utils/api_url";
import Link from "next/link";

const UserMenu = forwardRef<HTMLDivElement>((props, ref) => {

    const handleClickLogout = async () => {
        const res = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        })

        if (res.ok) {
            window.location.href = "/";
        }
    }

    return (
        <section ref={ref} className={styles.usermenu}>
            <ul>
                <Link href="/account"><li>Cuenta</li></Link>
                <Link href="/mis-cursos"><li>Mis Cursos</li></Link>
                <li className={styles.cerrarSesionBtn} onClick={handleClickLogout}>Cerrar sesión</li>
            </ul>
        </section>
    );
});

// Esto soluciona el warning de ESLint
UserMenu.displayName = "UserMenu";

export default UserMenu;
