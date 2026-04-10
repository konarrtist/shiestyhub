import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SHiESTY RAiDERS - Arc Raiders Trading Hub | #1 SHiESTY Item Exchange",
  description: "Join the largest Arc Raiders trading community. Trade blueprints, mods, salvaged gear & resources safely with escrow protection. 5000+ trades completed. Start trading now!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
