import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    "Making things on purpose, off the beaten path. London studio for murals and digital systems.",
  openGraph: {
    title: "OFF_COURSE",
    description:
      "A London studio working in two mediums: paint and code.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col bg-paper font-sans text-ink antialiased`}
      >
        <Header />
        <main className="flex-1 pt-24 md:pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
