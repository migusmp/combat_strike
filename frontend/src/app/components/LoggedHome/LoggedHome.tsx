"use client";
import styles from "./css/LoggedHome.module.css";
import Image from "next/image";
import { useState } from "react";
import UserMenu from "./components/UserMenu";

export default function LoggedHome() {
    const [menuUser, setUserMenu] = useState(false);
    const handleUserMenuClick = () => {
        if (menuUser) {
            setUserMenu(false);
        } else {
            setUserMenu(true);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <Image
                    src="/assets/logo-blanco-sin-texto.png"
                    width={80}
                    height={80}
                    alt="logo blanco combat strike"
                    style={{ cursor: "pointer" }}
                />
                <Image
                    src="/assets/usuario-sin-logo.png"
                    width={55}
                    height={55}
                    alt="logo texto combat strike"
                    onClick={handleUserMenuClick}
                    style={{
                        position: "absolute",
                        right: "4%",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                />
                {menuUser && <UserMenu />}
            </header>
        </>
    );
}
