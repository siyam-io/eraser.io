import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import TanStackProvider from "./providers/TanStackProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
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
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased font-sans bg-[#F0F0F0] text-[#121212] selection:bg-[#F0C020] selection:text-[#121212]`}
      >
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
