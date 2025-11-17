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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}