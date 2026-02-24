import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prediqo — Prove Your Sports IQ",
  description: "Compete globally. No money. Pure skill.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
