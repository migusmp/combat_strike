import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DL Combat Strike",
  description: "Defensa personal y krav maga israelí",
  icons: {
    icon: "/assets/logo-blanco-sin-texto.png", // favicon
  },
  openGraph: {
    title: "DL Combat Strike",
    description: "Defensa personal y krav maga israelí",
    images: ["/assets/logo-blanco-sin-texto.png"], // imagen de vista previa
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo-blanco-sin-texto.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
