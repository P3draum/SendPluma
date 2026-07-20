import type { Metadata } from "next";
import LandingPageClient from "@/components/LandingPage/LandingPageClient";

export const metadata: Metadata = {
  title: "SendPluma | O tempo devolve o peso às suas palavras.",
  description:
    "Fuja da ansiedade do imediato e resgate o ritual da correspondência. " +
    "Envie cartas digitais que viajam no ritmo real de uma ave mensageira.",
};

/**
 * Landing Page — Server Component raiz.
 * Delega todo o scrollytelling ao LandingPageClient (Client Component).
 * Mantém o Server Component limpo para SEO e metadata.
 */
export default function LandingPage() {
  return (
    <main className="bg-black">
      <LandingPageClient />
    </main>
  );
}
