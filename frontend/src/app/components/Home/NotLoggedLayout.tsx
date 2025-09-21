"use client";
import HeaderPrueba from "./HeaderPrueba";

export default function NotLoggedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <HeaderPrueba /> 
            <main style={{ marginTop: "85px" }}>
                {children}
            </main>
        </>
    );
}
