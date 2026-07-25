import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainShell } from "@/components/MainShell";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OFF_COURSE",
    template: "%s — OFF_COURSE",
  },
  description:
    "GO OFF COURSE. Sometimes getting lost is how brands get found.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-black antialiased">
        <Header />
        <MainShell>{children}</MainShell>
        <Footer />
      </body>
    </html>
  );
}
