import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resova Intelligence",
  description: "Intelligent analytics for Resova booking platform",
  keywords: "Resova, analytics, business intelligence, AI insights, booking platform",
  robots: "index, follow",
  authors: [{ name: "Resova" }],
  openGraph: {
    title: "Resova Intelligence",
    description: "Intelligent analytics for Resova booking platform",
    type: "website",
  },
  verification: {
    google: "resova-intelligence-official-partner",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}