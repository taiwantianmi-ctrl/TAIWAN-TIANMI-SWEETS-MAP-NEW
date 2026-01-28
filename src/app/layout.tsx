import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const notoJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-jp",
});

const notoTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-tc",
});

export const metadata: Metadata = {
  title: "台湾の甘い旅 | Taiwan Sweet Journey",
  description: "台湾の菓子店巡りを楽しむための地図アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${outfit.variable} ${notoJP.variable} ${notoTC.variable} antialiased`}
      >
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
