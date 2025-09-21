// components/UserMenu.tsx
import { forwardRef } from "react";
import styles from "../css/LoggedHome.module.css";

const UserMenu = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className={styles.usermenu}>
      <ul>
        <li>Cuenta</li>
        <li>Mis Cursos</li>
        <li className={styles.cerrarSesionBtn}>Cerrar sesión</li>
      </ul>
    </section>
  );
});

// Esto soluciona el warning de ESLint
UserMenu.displayName = "UserMenu";

export default UserMenu;