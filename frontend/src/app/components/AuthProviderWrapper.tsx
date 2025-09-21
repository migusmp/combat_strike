// src/app/components/AuthProviderWrapper.tsx
"use client";
import { ReactNode } from "react";
import { AuthProvider, useAuthContext } from "../context/AuthContext";
import LoggedLayout from "../components/LoggedHome/LoggedLayout";
import NotLoggedLayout from "../components/Home/NotLoggedLayout";
import LoadingSpinner from "./LoadingSpinner";
import { usePathname } from "next/navigation";

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
    );
}

function AuthWrapper({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthContext();
    const pathname = usePathname();

    if (isAuthenticated === null) return <LoadingSpinner />;

    // Rutas donde NO quieres header
    const noHeaderRoutes = ["/login", "/register", "/reset-password", "/forgot-password", "/verify"];
    const hideHeader = noHeaderRoutes.includes(pathname);

    if (hideHeader) return <>{children}</>; // solo el contenido, sin layout

    return isAuthenticated ? (
        <LoggedLayout>{children}</LoggedLayout>
    ) : (
        <NotLoggedLayout>{children}</NotLoggedLayout>
    );
}
