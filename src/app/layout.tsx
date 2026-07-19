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
      <body className="antialiased bg-stone-50 text-zinc-900 min-h-screen relative" suppressHydrationWarning>
        {/* Background persistente em todas as telas */}
        <div 
          className="fixed inset-0 z-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1552152370-fb05b25ff17d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnMlMjBza3l8ZW58MHx8fGJsdWV8MTc4NDQ2MzM5Nnww&ixlib=rb-4.1.0&q=85')", 
            backgroundSize: "cover", 
            backgroundPosition: "bottom" 
          }} 
        />
        
        <main className="relative z-10 min-h-screen">
          <GoogleMapProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </GoogleMapProvider>
        </main>
      </body>
    </html>
  );
}
