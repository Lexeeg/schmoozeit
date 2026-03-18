import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const rocketRaccoon = localFont({
  src: "./fonts/RocketRaccoonFreeRegular-woowx.ttf",
  variable: "--font-rocket-raccoon",
});

export const metadata: Metadata = {
  title: "Schmooze",
  description: "Schmooze – matchmaking by Yenta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${rocketRaccoon.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
