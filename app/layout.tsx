import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Judge",
  description: "Simple JavaScript code evaluator",
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
