"use client";
import { useAuthContext } from "@/app/context/AuthContext";
import HeaderPrueba from "./HeaderPrueba";

export default function NotLoggedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuthContext();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <HeaderPrueba isLogged={isAuthenticated} />
            <main style={{ marginTop: "85px", flex: 1 }}>{children}</main>
        </div>
    );
}

