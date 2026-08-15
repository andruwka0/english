import type { Metadata } from "next";
import { Comfortaa, Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Study",
  description: "Личный кабинет для учебы",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${comfortaa.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink font-sans">{children}</body>
    </html>
  );
}
