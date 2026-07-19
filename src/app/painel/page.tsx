"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, CheckCircle2, Mail, Send, Loader } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import PillNav from "@/components/PillNav";

type LetterStatus = "in_transit" | "delivered" | "read";

const StatusBadge = ({ status }: { status: LetterStatus }) => {
  if (status === "in_transit") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Em voo
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Chegou
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-150 text-zinc-550 border border-zinc-200">
      <Mail className="w-3.5 h-3.5" />
      Lida
    </span>
  );
};

export default function PainelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<any[]>([]);

  useEffect(() => {
    async function checkProfileAndFetchLetters() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.full_name || !profile.username) {
        router.push("/onboarding");
        return;
      }

      // Busca as cartas reais vinculando com os metadados da ave
      const { data: lettersData, error: lettersError } = await supabase
        .from("letters")
        .select("*, birds(name, image_url)")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (!lettersError && lettersData) {
        setLetters(lettersData);
      }
      setLoading(false);
    }
    checkProfileAndFetchLetters();
  }, [router]);

  const cartasEmVoo = letters.filter((l) => l.status === "in_transit");
  const arquivoCartas = letters.filter((l) => l.status === "delivered" || l.status === "read");

  const container: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function getRemainingTime(etaTimestamp: string | null) {
    if (!etaTimestamp) return "Calculando...";
    
    const now = new Date().getTime();
    const eta = new Date(etaTimestamp).getTime();
    
    if (isNaN(eta)) return "Calculando...";
    
    const diff = eta - now;
    if (diff <= 0) return "Chegando...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-zinc-650" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <PillNav />

      <div className="max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-16">
        {letters.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="backdrop-blur-md bg-white/70 p-10 rounded-[2rem] shadow-xl border border-white/50 text-center max-w-lg w-full">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 mb-4">
                O tempo devolve o peso<br />às suas palavras.
              </h2>
              <p className="text-zinc-700 text-sm sm:text-base leading-relaxed mb-8 px-2">
                Seu painel está pronto para registrar seus rituais. Envie sua primeira carta e veja o mundo através do voo de uma ave.
              </p>
              <Link
                href="/despachar"
                className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                Despachar minha primeira carta
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
          </div>
        ) : (
          <>
            {/* Page Header */}
            <header className="space-y-1">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-zinc-900">
                Meus Envios
              </h1>
              <p className="text-xs text-zinc-500">Acompanhe suas entregas e leia suas correspondências.</p>
            </header>

            {/* Cartas a Caminho */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-semibold text-zinc-900">Cartas a Caminho</h2>
                <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartasEmVoo.length}
                </span>
              </div>

              {cartasEmVoo.length === 0 ? (
                <div className="bg-white border border-zinc-100 rounded-3xl p-8 text-center text-xs text-zinc-500 shadow-xs">
                  Nenhuma ave está em voo no momento.
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {cartasEmVoo.map((letter) => (
                    <motion.div key={letter.id} variants={item}>
                      <Link href={`/rastreio/${letter.id}`}>
                        <div className="group flex flex-col justify-between gap-6 p-6 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-300 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm">
                          <div className="flex items-start justify-between">
                            <StatusBadge status={letter.status} />
                            <span className="text-[10px] font-medium text-zinc-500 border border-zinc-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-stone-50">
                              {letter.birds?.image_url && (
                                <img src={letter.birds.image_url} alt="" className="w-3.5 h-3.5 object-contain" />
                              )}
                              {letter.birds?.name || "Mensageiro"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">
                              Para: <span className="text-zinc-800 font-semibold">{letter.recipient_name}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Clock className="w-4 h-4 text-zinc-400" />
                              <span 
                                className={clsx(
                                  "font-bold tracking-tight text-zinc-900",
                                  getRemainingTime(letter.eta_timestamp).includes(":") 
                                    ? "font-mono text-2xl" 
                                    : "font-sans text-lg text-zinc-500"
                                )}
                              >
                                {getRemainingTime(letter.eta_timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>

            {/* Arquivo de Cartas */}
            <section className="space-y-5">
              <h2 className="font-serif text-xl font-semibold text-zinc-900 pb-4 border-b border-zinc-100">
                Arquivo de Cartas
              </h2>

              {arquivoCartas.length === 0 ? (
                <div className="bg-white border border-zinc-100 rounded-3xl p-8 text-center text-xs text-zinc-500 shadow-xs">
                  Seu arquivo está vazio.
                </div>
              ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                  {arquivoCartas.map((letter) => (
                    <motion.div key={letter.id} variants={item}>
                      <Link href={`/rastreio/${letter.id}`}>
                        <div
                          className={clsx(
                            "group flex items-center justify-between p-5 rounded-3xl border transition-all duration-200 cursor-pointer",
                            letter.status === "delivered"
                              ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
                              : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                                letter.status === "delivered" 
                                  ? "bg-emerald-100 border-emerald-200" 
                                  : "bg-zinc-100 border-zinc-200/60"
                              )}
                            >
                              {letter.birds?.image_url ? (
                                <img src={letter.birds.image_url} alt="" className="w-6 h-6 object-contain" />
                              ) : (
                                "✉️"
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-xs text-zinc-900">{letter.recipient_name}</span>
                                <StatusBadge status={letter.status} />
                              </div>
                              <p className="text-xs text-zinc-500 truncate max-w-xs sm:max-w-md">
                                {letter.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-5 shrink-0 ml-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Chegada</p>
                              <p className="text-xs text-zinc-800">{formatDate(letter.dispatched_at || letter.created_at)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-450 group-hover:text-zinc-700 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>
            
            {/* Empty State CTA */}
            <div className="flex justify-center pt-4">
              <Link
                href="/despachar"
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                <Send className="w-4 h-4" />
                Despachar uma nova carta
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
