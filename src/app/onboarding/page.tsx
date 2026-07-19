"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, User, AtSign, Loader } from "lucide-react";
import clsx from "clsx";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o usuário está logado
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
      } else {
        setUserId(user.id);
        
        // Verifica se o usuário já tem perfil completo
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", user.id)
          .single();
          
        if (profile?.full_name && profile?.username) {
          router.push("/painel");
        } else {
          setCheckingUser(false);
        }
      }
    }
    checkAuth();
  }, [router]);

  async function handleNextStep() {
    setError(null);
    if (step === 1) {
      if (!fullName.trim()) {
        setError("Por favor, insira seu nome completo.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (cleanUsername.length < 3) {
        setError("O nome de usuário deve ter pelo menos 3 caracteres.");
        return;
      }
      
      setLoading(true);
      try {
        // Verifica se o username já existe
        const { data, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", cleanUsername)
          .maybeSingle();

        if (checkError) throw checkError;
        if (data && data.id !== userId) {
          setError("Este nome de usuário já está em uso.");
          setLoading(false);
          return;
        }

        // Salva no banco de dados
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            username: cleanUsername,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updateError) throw updateError;
        setStep(3);
      } catch (err: any) {
        setError(err.message || "Erro ao salvar perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-zinc-650" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      {/* Background blobs decorativos */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-zinc-150 rounded-3xl p-8 shadow-xs relative z-10">
        
        {/* Progresso do Onboarding */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx(
                "h-1 rounded-full transition-all duration-300",
                s === step
                  ? "w-8 bg-zinc-900"
                  : s < step
                  ? "w-4 bg-zinc-900/40"
                  : "w-4 bg-zinc-200"
              )}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="font-serif text-3xl font-semibold text-zinc-900 tracking-tight">
                  Bem-vindo à SendPluma
                </h1>
                <p className="text-xs text-zinc-600">
                  Para começar, como gostaria de ser chamado na plataforma?
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="fullname" className="block text-xs font-semibold text-zinc-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl pl-11 pr-4 py-3.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="font-serif text-3xl font-semibold text-zinc-900 tracking-tight">
                  Escolha seu username
                </h1>
                <p className="text-xs text-zinc-600">
                  O nome de usuário é único e serve para identificar você ao enviar e receber cartas.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="block text-xs font-semibold text-zinc-700">
                  Nome de Usuário (@)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="username"
                    type="text"
                    placeholder="seu_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl pl-11 pr-4 py-3.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="w-full bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Finalizar Cadastro"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-semibold text-zinc-900 tracking-tight">
                  Tudo pronto!
                </h1>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                  Seu perfil foi configurado. Agora você já pode escrever suas correspondências no ritmo lento de nossas aves.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/painel")}
                className="w-full bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
              >
                Ir para o meu Painel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
