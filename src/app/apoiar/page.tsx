"use client";

import { useState } from "react";
import PillNav from "@/components/PillNav";
import { Feather, Heart, Check, Zap, Infinity as InfinityIcon } from "lucide-react";
import { getLimiteCartas } from "@/lib/limits";

export default function ApoiarPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSupport = (tier: string) => {
    setLoadingTier(tier);
    // Simula integrao com Stripe/MercadoPago
    setTimeout(() => {
      alert(`Integração simulada! Redirecionando para checkout do tier: ${tier}`);
      setLoadingTier(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen font-sans">
      <PillNav />

      <div className="max-w-5xl mx-auto px-6 pt-36 pb-24 space-y-16 relative z-10">
        
        {/* Header */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-2 shadow-sm border border-emerald-100">
            <Heart className="w-6 h-6 fill-emerald-500/20" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
            Apoie o desenvolvimento
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            O SendPluma existe para resgatar a calma na comunicação. Ao se tornar um apoiador, você ajuda a manter os servidores vivos e garante benefícios exclusivos para os seus envios.
          </p>
        </header>

        {/* Tiers / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Free Tier */}
          <div className="backdrop-blur-md bg-white/60 border border-zinc-200/60 p-8 rounded-3xl shadow-sm flex flex-col">
            <h2 className="font-serif text-2xl font-semibold text-zinc-900 mb-2">Free</h2>
            <p className="text-xs text-zinc-500 mb-6">A experiência essencial da escrita.</p>
            <div className="text-4xl font-bold text-zinc-900 mb-8">
              R$ 0 <span className="text-sm font-normal text-zinc-500">/para sempre</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start gap-3 text-sm text-zinc-700">
                <Check className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                Limite de {getLimiteCartas('free')} cartas ativas
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-700">
                <Check className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                Acesso aos pombos básicos
              </li>
            </ul>
            <button disabled className="w-full py-3 rounded-full bg-zinc-100 text-zinc-400 text-sm font-medium cursor-not-allowed">
              Plano Atual
            </button>
          </div>

          {/* Supporter Tier (Destaque) */}
          <div className="backdrop-blur-md bg-white/80 border border-emerald-200 p-8 rounded-3xl shadow-xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                Recomendado
              </span>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-zinc-900 mb-2">Supporter</h2>
            <p className="text-xs text-zinc-500 mb-6">Para quem escreve com frequência.</p>
            <div className="text-4xl font-bold text-zinc-900 mb-8">
              R$ 12 <span className="text-sm font-normal text-zinc-500">/mês</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                Limite ampliado de {getLimiteCartas('supporter')} cartas
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 fill-amber-500/20" />
                Falcões peregrinos (+50% velozes)
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-700">
                <Feather className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                Selo de apoiador no perfil
              </li>
            </ul>
            <button 
              onClick={() => handleSupport('supporter')}
              className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loadingTier === 'supporter' ? "Processando..." : "Tornar-se Supporter"}
            </button>
          </div>

          {/* Founder Tier */}
          <div className="backdrop-blur-md bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl shadow-lg flex flex-col text-zinc-100">
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">Founder</h2>
            <p className="text-xs text-zinc-400 mb-6">Para os mecenas originais do projeto.</p>
            <div className="text-4xl font-bold text-white mb-8">
              R$ 29 <span className="text-sm font-normal text-zinc-500">/mês</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <InfinityIcon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                Envios ilimitados
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 fill-amber-400/20" />
                Toda frota desbloqueada
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <Feather className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                Selo dourado exclusivo de Fundador
              </li>
            </ul>
            <button 
              onClick={() => handleSupport('founder')}
              className="w-full py-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loadingTier === 'founder' ? "Processando..." : "Apoiar como Founder"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
