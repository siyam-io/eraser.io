import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import TanStackProvider from "./providers/TanStackProvider";

/* Serif as hero: display, body, and mono labels. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ERASIOR.IO",
  description: "Constructivist Modernism Workspace",
};

import { AuthProvider } from "./providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <TanStackProvider>

            {children}
            <Toaster />

          </TanStackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
