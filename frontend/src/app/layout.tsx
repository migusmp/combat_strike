// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper"; // Client component

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const canonicalUrl = "https://dlcombatstrike.com";

export const metadata: Metadata = {
    title: "DL Combat Strike",
    description: "Defensa personal y krav maga",
    icons: {
        icon: "/assets/logo-blanco-sin-texto.png",
    },
    openGraph: {
        title: "DL Combat Strike",
        description: "Defensa personal y krav maga",
        url: canonicalUrl,
        images: ["/assets/logo-blanco-sin-texto.png"],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="index,follow" />
                <link rel="icon" href="/assets/logo-blanco-sin-texto.png" />
                <link rel="canonical" href={canonicalUrl} />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProviderWrapper>{children}</AuthProviderWrapper>
            </body>
        </html>
    );
}
