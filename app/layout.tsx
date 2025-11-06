import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapCut Style Video Editor",
  description: "Web-based video editor with text animations, transitions, and sound effects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
