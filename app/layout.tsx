import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "griffin.video - AI Family Guy Videos",
  description:
    "Turn any topic into a hilarious Peter & Stewie conversation with AI voice cloning and Minecraft backgrounds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-black dark:bg-black dark:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
