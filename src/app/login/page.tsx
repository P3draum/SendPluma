"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import GoogleLoginButton from "@/components/GoogleLoginButton";

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-6 w-full">
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-xs text-zinc-400 font-medium select-none">ou</span>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Cadastro realizado com sucesso! Verifique seu e-mail para confirmação.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/painel");
      }
    } catch (err: any) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex">
      {/* Lado Esquerdo: Formulário (Mobile First) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 min-h-screen bg-stone-50 lg:bg-white">
        
        {/* Topo (Voltar) */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
          >
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar ao início
          </Link>
        </div>

        {/* Formulário Centralizado */}
        <div className="w-full max-w-md mx-auto my-auto py-10">
          {/* Card visual no mobile, layout invisível no desktop */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-sm lg:border-none lg:shadow-none lg:p-0">
            
            {/* Logo + Cabeçalho */}
            <div className="flex flex-col items-center lg:items-start gap-3 mb-8">
              <Link
                href="/"
                className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900 text-white text-xl"
              >
                🕊
              </Link>
              <h1 className="font-serif text-3xl font-semibold text-zinc-900 tracking-tight mt-2">
                Entrar na SendPluma
              </h1>
              <p className="text-xs text-zinc-500 text-center lg:text-left">
                Bem-vindo de volta. Suas cartas estão esperando.
              </p>
            </div>

            {/* Erro global */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <GoogleLoginButton />

            <Divider />

            {/* Formulário de Email */}
            <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-700">
                    Senha
                  </label>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60"
                />
              </div>

              {/* Botão de Submit */}
              <button
                id="email-login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white text-xs font-medium px-6 py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (isSignUp ? "Cadastrando…" : "Entrando…") : (isSignUp ? "Cadastrar" : "Entrar")}
                {!loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
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
                )}
              </button>
            </form>

            {/* Cadastro */}
            <p className="mt-7 text-center lg:text-left text-xs text-zinc-500">
              {isSignUp ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((prev) => !prev);
                  setError(null);
                }}
                className="text-zinc-900 font-semibold hover:underline bg-transparent border-none cursor-pointer focus:outline-none"
              >
                {isSignUp ? "Entrar" : "Cadastre-se"}
              </button>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center lg:text-left text-xs text-zinc-400">
          © 2026 SendPluma.
        </div>
      </div>

      {/* Lado Direito: Visual (Split Screen - Desktop apenas) */}
      <div
        className="hidden lg:flex lg:w-[45%] bg-cover bg-center relative items-end p-16"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1552152370-fb05b25ff17d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnMlMjBza3l8ZW58MHx8fGJsdWV8MTc4NDQ2MzM5Nnww&ixlib=rb-4.1.0&q=85')",
        }}
      >
        {/* Overlay escuro translúcido robusto para contraste do texto */}
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-transparent" />

        {/* Bloco de Conteúdo (Card Sólido de Alto Contraste para Conformidade WCAG) */}
        <div 
          className="relative z-10 text-white p-8 rounded-2xl border border-zinc-800 max-w-md space-y-4"
          style={{ backgroundColor: '#09090b' }}
        >
          <blockquote className="font-serif text-3xl font-light italic leading-relaxed text-zinc-100">
            &ldquo;O tempo devolve o peso às suas palavras.&rdquo;
          </blockquote>
          <p className="text-base text-zinc-200 leading-relaxed font-sans">
            Na SendPluma, cada correspondência é tratada como um ritual. Suas cartas viajam no próprio ritmo de uma ave real, tornando o ato de receber uma surpresa inesquecível.
          </p>
        </div>
      </div>
    </div>
  );
}
