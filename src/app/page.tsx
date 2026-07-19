import type { Metadata } from "next";
import Link from "next/link";
import { Map, Bird, Scroll, Feather, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "SendPluma | O tempo devolve o peso às suas palavras.",
  description:
    "Envie cartas digitais no ritmo lento de aves virtuais. Fuja da ansiedade e crie conexões profundas no seu próprio tempo.",
};

const features = [
  {
    icon: Map,
    title: "Rastreamento em Tempo Real",
    description:
      "O tempo de entrega é calculated com precisão matemática usando as coordenadas físicas exatas entre você e o destinatário.",
  },
  {
    icon: Bird,
    title: "Frota Personalizada",
    description:
      "De pombos clássicos a falcões velozes. Escolha o mensageiro ideal no catálogo de acordo com a urgência da sua carta.",
  },
  {
    icon: Scroll,
    title: "Abertura Imersiva",
    description:
      "A mensagem permanece protegida por um selo de cera virtual até a chegada. Uma interação tátil que valoriza quem lê.",
  },
];

const Header = () => (
  <header className="absolute top-0 left-0 right-0 py-8 px-6 flex justify-center items-center z-50">
    <div className="flex items-center gap-2.5">
      <div className="bg-zinc-900 text-white p-1.5 rounded-lg shadow-sm">
        <Feather className="w-5 h-5" />
      </div>
      <span className="font-serif font-bold text-xl text-zinc-900 tracking-tight">SendPluma</span>
    </div>
  </header>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans">
      <Header />
      
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center pt-48 pb-28 px-6">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.08] tracking-tight text-zinc-900 max-w-3xl">
          O tempo devolve o peso<br />às suas palavras.
        </h1>

        <h2 className="mt-8 text-zinc-600 text-lg sm:text-xl max-w-xl leading-relaxed font-normal">
          Fuja da ansiedade do imediato. Envie cartas digitais que viajam no próprio
          ritmo e acompanhe cada quilômetro. Transforme mensagens do dia a dia em
          rituais inesquecíveis.
        </h2>

        <div className="mt-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Acessar o SendPluma
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Landscape / Ghibli Image */}
      <section
        className="relative w-full h-[500px]"
        role="img"
        aria-label="Montanhas azuis em camadas como uma paisagem de aquarela"
      >
        {/* Gradient fade: branco → transparente no topo */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

        {/* Imagem de fundo */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1552152370-fb05b25ff17d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnMlMjBza3l8ZW58MHx8fGJsdWV8MTc4NDQ2MzM5Nnww&ixlib=rb-4.1.0&q=85')",
          }}
        />
      </section>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto px-6 py-28 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800 shadow-sm">
                <Icon className="w-5 h-5 text-zinc-900" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        <div className="flex items-center justify-center gap-2">
          <span>© 2026 SendPluma</span>
          <span className="flex items-center gap-1 text-zinc-500">
            {/* Ícone de carta e ave reforçando o conceito */}
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <Bird className="w-3.5 h-3.5 text-zinc-400 mr-1" />
            Feito com muito café
          </span>
        </div>
      </footer>
    </div>
  );
}
