import type { Metadata } from "next";
import {
  DM_Serif_Display,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Insighta Labs+",
  description: "Profile Intelligence System — Secure Access Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetBrainsMono.variable} dark h-full antialiased`}
    >
      <body className="bg-ink text-cream font-sans min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
