import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Judge - Code Evaluation Platform",
  description: "A simple code judge for testing JavaScript code with test cases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
