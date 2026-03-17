import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${rocketRaccoon.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
