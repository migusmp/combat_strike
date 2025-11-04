"use client"; // Indica que este componente se renderiza del lado del cliente (React/Next.js)
import Image from "next/image";
import Link from "next/link";
import styles from "../../css/HeaderPrueba.module.css";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "../LoggedHome/components/UserMenu";

interface HeaderProps {
  toggleUserMenu?: () => void;
  isLogged: boolean; // Define si el usuario está autenticado
}

export default function HeaderPrueba({
  isLogged,
  toggleUserMenu,
}: HeaderProps) {
  // --- ESTADOS PRINCIPALES ---
  const [loginMenu, setLoginMenu] = useState(false); // Controla la visibilidad del menú de login (si no está logeado)
  const [darkBg, setDarkBg] = useState(false); // Controla si el fondo del header debe oscurecerse al hacer scroll
  const [menuUser, setUserMenu] = useState(false); // Controla el menú del usuario logeado
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Controla la apertura del menú móvil (hamburguesa)

  // --- REFERENCIAS ---
  const menuRef = useRef<HTMLDivElement>(null); // Referencia al menú desplegable del usuario logeado
  const iconRef = useRef<HTMLImageElement>(null); // Referencia al icono del usuario logeado
  const loginMenuRef = useRef<HTMLDivElement>(null); // Referencia al menú de login (para detectar clicks fuera)

  // --- HOOKS DE NAVEGACIÓN ---
  const router = useRouter();
  const pathname = usePathname();

  // --- FUNCIONES DE TOGGLE ---
  const toggleLoginMenu = () => setLoginMenu(!loginMenu); // Abre/cierra el menú de login
  const toggleUserDropdown = () => setUserMenu(!menuUser); // Abre/cierra el menú del usuario logeado
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen); // Abre/cierra el menú móvil

  // --- EFECTO: Cerrar el menú del usuario al hacer click fuera ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuUser && // Solo si el menú está abierto
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) && // Si el click no fue dentro del menú
        iconRef.current &&
        !iconRef.current.contains(event.target as Node) // Ni sobre el icono
      ) {
        setUserMenu(false); // Cierra el menú
      }
    };

    // Añadimos el listener global al documento
    document.addEventListener("click", handleClickOutside);
    // Lo eliminamos al desmontar el componente para evitar fugas de memoria
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuUser]);

  // --- EFECTO: Cerrar el menú de login al hacer click fuera ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loginMenu && // Solo si el menú está abierto
        loginMenuRef.current &&
        !loginMenuRef.current.contains(event.target as Node) // Si el click no fue dentro del menú
      ) {
        setLoginMenu(false); // Cierra el menú
      }
    };

    // Listener global al documento
    document.addEventListener("click", handleClickOutside);
    // Limpieza al desmontar
    return () => document.removeEventListener("click", handleClickOutside);
  }, [loginMenu]);

  // --- EFECTO: Cambiar el fondo del header al hacer scroll ---
  useEffect(() => {
    const handleScroll = () => {
      // Si se hace scroll hacia abajo, el fondo se oscurece
      setDarkBg(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Ejecuta una vez al inicio
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- FUNCION AUXILIAR ---
  // Añade una clase "active" al enlace que coincide con la ruta actual
  const getLinkClass = (href: string) =>
    pathname === href ? styles.active : "";

  // --- RENDER PRINCIPAL ---
  return (
    <>
      {/* --- HEADER PRINCIPAL --- */}
      <header
        className={styles.header}
        style={{
          backgroundColor: darkBg ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 1)",
          backdropFilter: darkBg
            ? "blur(8px) brightness(0.6)"
            : "blur(8px) brightness(1)",
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        {/* --- LOGO PRINCIPAL --- */}
        <Image
          width={70}
          height={70}
          src="/assets/logo-blanco-sin-texto-small.webp"
          alt="logotipo de combat strike"
          style={{ cursor: "pointer" }}
          className={styles.logoCombatStrike}
          onClick={() => router.push("/")} // Al hacer click redirige al inicio
        />

        {/* --- CONTENEDOR PRINCIPAL DE BOTONES Y NAV --- */}
        <div className={styles.buttons}>
          {/* --- NAV PRINCIPAL (DESKTOP) --- */}
          <nav aria-label="Navegación principal" className={styles.desktopNav}>
            <Link href="/" className={getLinkClass("/")}>
              Inicio
            </Link>
            <Link href="/cursos" className={getLinkClass("/cursos")}>
              Cursos
            </Link>
            <Link href="/productos" className={getLinkClass("/productos")}>
              Productos
            </Link>
            <Link href="/contact" className={getLinkClass("/contact")}>
              Contáctanos
            </Link>
          </nav>

          {/* --- USUARIO LOGEADO --- */}
          {isLogged ? (
            <div className={styles.icons}>
              {/* Icono de notificaciones */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="33"
                height="33"
                fill="currentColor"
                className={styles.bellIcon}
                style={{ cursor: "pointer" }}
                viewBox="0 0 16 16"
              >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
              </svg>

              {/* Icono del usuario + menú desplegable */}
              <div className={styles.profileContainer}>
                <Image
                  ref={iconRef} // Referencia usada para detectar clicks fuera
                  src="/assets/user_logo.svg"
                  alt="imagen de usuario"
                  width={45}
                  height={45}
                  className={styles.userImage}
                  onClick={toggleUserDropdown} // Abre/cierra el menú del usuario
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
                {/* Si el menú está activo, se muestra */}
                {menuUser && <UserMenu ref={menuRef} />}
              </div>
            </div>
          ) : (
            // --- USUARIO NO LOGEADO ---
            <>
              {/* Icono de usuario que abre el menú de login */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="45"
                height="45"
                fill="currentColor"
                className={styles.userIcon}
                onClick={toggleLoginMenu}
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                />
              </svg>

              {/* Menú desplegable del login */}
              {loginMenu && (
                <div ref={loginMenuRef} className={styles.userMenu}>
                  <Link href="/login">
                    <button className={styles.loginBtnDropdown}>
                      Iniciar sesión
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className={styles.registerBtnDropdown}>
                      Registrate
                    </button>
                  </Link>
                </div>
              )}

              {/* Botones visibles en escritorio */}
              <div className={styles.divider}>
                <Link href="/login">
                  <button className={styles.loginBtn}>Iniciar sesión</button>
                </Link>
                <Link href="/register">
                  <button className={styles.registerBtn}>Registrarse</button>
                </Link>
              </div>
            </>
          )}

          {/* --- BOTÓN HAMBURGUESA (para móviles) --- */}
          <button
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="Abrir menú"
          >
            {/* Líneas del icono hamburguesa animadas */}
            <span
              className={`${styles.bar} ${mobileMenuOpen ? styles.bar1 : ""}`}
            ></span>
            <span
              className={`${styles.bar} ${mobileMenuOpen ? styles.bar2 : ""}`}
            ></span>
            <span
              className={`${styles.bar} ${mobileMenuOpen ? styles.bar3 : ""}`}
            ></span>
          </button>
        </div>
      </header>

      {/* --- MENÚ MÓVIL --- */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        <nav>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)} // Cierra menú al navegar
            className={styles.mobileLink}
          >
            Inicio
          </Link>

          {/* Enlaces condicionales para usuarios logeados */}
          {isLogged && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={styles.mobileLink}
            >
              Perfil
            </Link>
          )}

          <Link
            href="/cursos"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileLink}
          >
            Cursos
          </Link>

          {isLogged && (
            <Link
              href="/my-courses"
              onClick={() => setMobileMenuOpen(false)}
              className={styles.mobileLink}
            >
              Mis cursos
            </Link>
          )}

          <Link
            href="/productos"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileLink}
          >
            Productos
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileLink}
          >
            Contáctanos
          </Link>

          {/* Botones para usuarios no logeados en mobile */}
          {!isLogged && (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className={styles.loginBtnMobile}>
                  Iniciar sesión
                </button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className={styles.registerBtnMobile}>
                  Registrarse
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
