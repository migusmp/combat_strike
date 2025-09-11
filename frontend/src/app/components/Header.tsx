import { useEffect, useState } from "react";
import HeaderDesktop from "./HeaderDesktop";
import HeaderMobile from "./HeaderMobile";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Ejecutar al montar
    const checkMobile = () => setIsMobile(window.innerWidth <= 505);

    checkMobile(); // Comprobar al cargar

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <HeaderMobile /> : <HeaderDesktop />;
}
