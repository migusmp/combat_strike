"use client";
import HeaderPrueba from "./HeaderPrueba";

export default function NotLoggedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <HeaderPrueba />
            <main style={{ marginTop: "85px", flex: 1 }}>{children}</main>
        </div>
    );
}

