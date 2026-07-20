import type { Metadata } from "next";
import { Jost, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import GoogleMapProvider from "@/components/GoogleMapProvider";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "SendPluma | O tempo devolve o peso às suas palavras.",
  description: "Envie cartas digitais no ritmo lento de aves virtuais. Fuja da ansiedade e crie conexões profundas no seu próprio tempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${jost.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className="antialiased bg-black text-zinc-900 min-h-screen" suppressHydrationWarning>
        <main className="relative min-h-screen">
          <GoogleMapProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </GoogleMapProvider>
        </main>
      </body>
    </html>
  );
}
