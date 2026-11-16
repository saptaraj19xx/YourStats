import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourStats — PUBG Player Intelligence",
  description: "Deep PUBG PC player statistics, match insights and weapon analytics."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
