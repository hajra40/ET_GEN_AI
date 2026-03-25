import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Money Mentor",
  description:
    "AI-powered personal finance mentor for Indian users with FIRE planning, tax, portfolio analytics, and life-event guidance."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
