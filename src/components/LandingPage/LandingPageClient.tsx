"use client";

/**
 * LandingPageClient — Scrollytelling completo do SendPluma
 *
 * ─────────────────────────────────────────────────────────────────────
 * ARQUITETURA DE SOBREPOSIÇÃO (OVERLAPPING):
 *
 *  <div style="height:700vh">  ← gera 600vh de scroll utilizável
 *    <div className="sticky top-0 h-[100dvh]">  ← viewport preso
 *      <div z-10 /> ← Cena 1 (base)
 *      <div z-20 /> ← Cena 2 (opacity:0 → 1)
 *      <div z-30 /> ← Cena 3 / JornadaVoo (opacity:0 → 1)
 *      <div z-40 /> ← Cena 4 (opacity:0 → 1)
 *    </div>
 *  </div>
 *
 * UMA ÚNICA TIMELINE GSAP (scrub:1) controla todo o scrollytelling.
 * Cada unidade da timeline = 100vh de scroll (600vh / 6 unidades).
 *
 * MAPA DE TIMING:
 *   t 0.0 → 0.4   Cena 1: texto some
 *   t 0.0 → 1.5   Cena 1: parallax da imagem
 *   t 1.2 → 2.0   Cena 1: fade to black (overlay preto cobre tudo)
 *   t 2.0 → 2.8   Cena 2: fade in
 *   t 3.5 → 4.0   Cena 3: fade in sobre Cena 2
 *   t 4.0 → 5.0   Cena 3: crossfade bg Dia → Tarde
 *   t 4.0 → 4.3   Cena 3: texto aparece
 *   t 5.0 → 5.8   Cena 3: crossfade bg Tarde → Noite
 *   t 5.5 → 5.8   Cena 3: texto some
 *   t 5.7 → 6.0   Cena 4: fade in (encerramento)
 * ─────────────────────────────────────────────────────────────────────
 */

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPageClient() {
  // ── Ref raiz: trigger do ScrollTrigger e escopo do useGSAP ──────────
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Cena 1 — O Resgate ──────────────────────────────────────────────
  const s1ImageRef   = useRef<HTMLDivElement>(null); // imagem com parallax
  const s1ContentRef = useRef<HTMLDivElement>(null); // texto + CTA (some)
  const s1BlackRef   = useRef<HTMLDivElement>(null); // overlay preto (fade to black)

  // ── Cena 2 — O Despacho ─────────────────────────────────────────────
  const s2Ref = useRef<HTMLDivElement>(null); // container da cena inteira

  // ── Cena 3 — A Jornada (crossfade de fundos) ────────────────────────
  const s3Ref     = useRef<HTMLDivElement>(null); // container da cena
  const s3bg2Ref  = useRef<HTMLDivElement>(null); // fundo Tarde (opacity: 0→1)
  const s3bg3Ref  = useRef<HTMLDivElement>(null); // fundo Noite (opacity: 0→1)
  const s3TextRef = useRef<HTMLDivElement>(null); // texto (aparece e some)

  // ── Cena 4 — A Chegada ──────────────────────────────────────────────
  const s4Ref = useRef<HTMLDivElement>(null); // container da cena

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      /**
       * Timeline principal — vinculada ao scroll do wrapper.
       * `scrub: 1` adiciona 1s de suavização após o usuário parar de rolar.
       * `invalidateOnRefresh: true` recalcula posições ao redimensionar janela.
       * `ease: 'none'` como padrão: cada frame corresponde linearmente ao scroll.
       */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── CENA 1: Parallax + texto some + fade to black ────────────────

      // Texto e CTA sobem e desaparecem rapidamente (primeiros 40% do scroll)
      tl.to(
        s1ContentRef.current,
        { opacity: 0, y: -60, duration: 0.4 },
        0
      );

      // Imagem faz zoom-out + translateY suave (toda a duração da Cena 1)
      tl.fromTo(
        s1ImageRef.current,
        { scale: 1, y: "0%" },
        { scale: 1.12, y: "8%", duration: 1.5 },
        0
      );

      // Overlay preto cobre a Cena 1, preparando o fade-in da Cena 2
      // O "fade to black" cria a transição cinematográfica escura → clara
      tl.fromTo(
        s1BlackRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        1.2 // começa depois do parallax inicial
      );

      // ── CENA 2: Fade in sobre o preto ────────────────────────────────

      tl.fromTo(
        s2Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        2.0 // exatamente quando o preto está completo
      );

      // ── CENA 3: Fade in + crossfade dia→tarde→noite ──────────────────

      // A Cena 3 dissolve-se sobre a Cena 2 (z-30 > z-20)
      tl.fromTo(
        s3Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        3.5
      );

      // Crossfade 1: Fundo Dia → Tarde (1 unidade = 100vh de scroll)
      tl.fromTo(
        s3bg2Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.0 },
        4.0
      );

      // Crossfade 2: Fundo Tarde → Noite
      tl.fromTo(
        s3bg3Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        5.0
      );

      // Texto da Cena 3: aparece no início do crossfade
      tl.fromTo(
        s3TextRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.3 },
        4.0
      );

      // Texto da Cena 3: some antes de chegar na Cena 4
      tl.to(
        s3TextRef.current,
        { opacity: 0, y: -25, duration: 0.3 },
        5.5
      );

      // ── CENA 4: Fade in (encerramento) ───────────────────────────────

      // Dissolve sobre a noite estrelada da Cena 3 (z-40 > z-30)
      tl.fromTo(
        s4Ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        5.7 // total timeline = 6.0 ✓
      );
    },
    { scope: wrapperRef } // cleanup automático ao desmontar
  );

  return (
    /**
     * Wrapper: height: 700vh define o scroll total.
     * 700vh = 100vh (viewport) + 600vh (área rolável = 6 × 100vh).
     * O scroll-behavior: smooth foi removido do globals.css para não
     * conflitar com o scrub do GSAP.
     */
    <div ref={wrapperRef} style={{ height: "700vh" }}>

      {/**
       * Viewport sticky: fica preso no topo enquanto o scroll ocorre.
       * bg-black: garante fundo escuro durante transições / lacunas.
       * overflow-hidden: impede que imagens com scale > 1 vazem.
       */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-black">

        {/* ═══════════════════════════════════════════════════════════
            CENA 1 — "O Resgate"
            z-10: camada base, sempre visível até ser coberta.
            Contém: imagem com parallax, gradiente, texto, overlay preto.
        ═══════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 z-10">

          {/* Imagem de fundo com parallax via GSAP */}
          <div
            ref={s1ImageRef}
            className="absolute inset-0 will-change-transform"
            aria-hidden="true"
          >
            <picture className="absolute inset-0 w-full h-full -z-10">
              <source media="(min-width: 768px)" srcSet="/LandingPage/cena-01-menina-closeup.webp" />
              <img
                src="/LandingPage/cena-01-menina-closeup-mobile.webp"
                alt="Jovem mulher segurando uma carta — protagonista SendPluma"
                className="object-cover object-center w-full h-full"
              />
            </picture>
          </div>

          {/* Gradiente: apenas na metade inferior, preserva o rosto no topo */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[55%]
                       bg-gradient-to-t from-black/90 via-black/55 to-transparent"
            aria-hidden="true"
          />

          {/* Conteúdo textual — some durante o scroll (GSAP: y + opacity) */}
          <div
            ref={s1ContentRef}
            className="absolute bottom-0 left-0 right-0
                       pb-10 md:pb-16 px-4 md:px-8
                       will-change-transform"
          >
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-white/60 text-[10px] md:text-xs uppercase
                            tracking-[0.25em] font-sans font-light mb-3 md:mb-4">
                Correspondências com alma
              </p>
              <h1 className="font-serif font-semibold text-white leading-[1.1]
                             tracking-tight text-3xl md:text-5xl lg:text-6xl
                             mb-3 md:mb-5">
                O tempo devolve o peso às suas palavras.
              </h1>
              <p className="font-sans font-light text-white/80 leading-relaxed
                            text-sm md:text-lg max-w-xl mx-auto mb-7 md:mb-9">
                Fuja da ansiedade do imediato e resgate o ritual da correspondência.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/login"
                  id="hero-cta-button"
                  className="group inline-flex items-center justify-center gap-2
                             bg-white text-zinc-900 font-sans font-semibold
                             text-sm md:text-base px-8 py-4 rounded-full
                             shadow-lg shadow-black/25
                             transition-all duration-300 ease-out
                             hover:bg-white/95 hover:shadow-xl hover:scale-[1.02]
                             active:scale-[0.98] w-full sm:w-auto"
                >
                  Escrever no meu ritmo
                  <span
                    className="inline-block transition-transform duration-300
                               group-hover:translate-x-1"
                    aria-hidden="true"
                  >→</span>
                </Link>
              </div>
            </div>

            {/* Indicador de scroll — vai embora junto com o texto */}
            <div
              className="mt-8 flex flex-col items-center gap-1 pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-white/30 text-[9px] uppercase tracking-widest font-sans">
                Role
              </span>
              <div className="w-px h-8 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full h-2.5 bg-white/30 rounded-full"
                  style={{ animation: "splScrollDot 1.8s ease-in-out infinite" }}
                />
              </div>
            </div>
          </div>

          {/**
           * Overlay "Fade to Black" — a transição cinematográfica.
           * GSAP anima opacity: 0 → 1, cobrindo a Cena 1 completamente.
           * A Cena 2 (z-20) então dissolve-se sobre este preto.
           */}
          <div
            ref={s1BlackRef}
            className="absolute inset-0 bg-black"
            style={{ opacity: 0 }}
            aria-hidden="true"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CENA 2 — "O Despacho"
            z-20: aparece sobre a Cena 1 escurecida.
            opacity começa em 0; GSAP faz o fade-in.
        ═══════════════════════════════════════════════════════════ */}
        <div
          ref={s2Ref}
          className="absolute inset-0 z-20 will-change-[opacity]"
          style={{ opacity: 0 }}
          aria-label="Cena 2 — O Despacho"
        >
          {/* Imagem de fundo */}
          <div className="absolute inset-0" aria-hidden="true">
            <picture className="absolute inset-0 w-full h-full -z-10">
              <source media="(min-width: 768px)" srcSet="/LandingPage/cena-02-entrega-varanda.webp" />
              <img
                src="/LandingPage/cena-02-entrega-varanda-mobile.webp"
                alt="Cena de entrega de carta em uma varanda ao entardecer"
                className="object-cover object-center w-full h-full"
              />
            </picture>
          </div>

          {/* Gradiente inferior */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[60%]
                       bg-gradient-to-t from-black/90 via-black/55 to-transparent"
            aria-hidden="true"
          />

          {/* Conteúdo */}
          <div className="absolute bottom-0 left-0 right-0 pb-12 md:pb-20 px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-white/60 text-[10px] md:text-xs uppercase
                            tracking-[0.25em] font-sans font-light mb-3 md:mb-4">
                O Despacho
              </p>
              <h2 className="font-serif font-semibold text-white leading-[1.1]
                             tracking-tight text-3xl md:text-5xl lg:text-[3.5rem]
                             mb-4 md:mb-6">
                Escreva no seu ritmo.
              </h2>
              <p className="font-sans font-light text-white/80 leading-relaxed
                            text-sm md:text-lg max-w-xl mx-auto">
                Quando estiver pronto, confie sua mensagem aos nossos mensageiros.
                Você escolhe a ave, nós calculamos a rota.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CENA 3 — "A Jornada" (crossfade dia → tarde → noite)
            z-30: dissolve sobre a Cena 2.
            Três backgrounds empilhados (absolute inset-0) no mesmo espaço.
            O falcão fica fixo no centro em z-50 relativo à cena.
        ═══════════════════════════════════════════════════════════ */}
        <div
          ref={s3Ref}
          className="absolute inset-0 z-30 will-change-[opacity]"
          style={{ opacity: 0 }}
          aria-label="Cena 3 — A Jornada"
        >
          {/* ── Background 1: Dia (base permanente) ──────────────────── */}
          <div className="absolute inset-0 z-10" aria-hidden="true">
            <Image
              src="/LandingPage/cena-03-bg-1-dia.webp"
              alt="Céu azul durante o dia"
              fill
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* ── Background 2: Tarde (crossfade sobre o dia) ───────────── */}
          <div
            ref={s3bg2Ref}
            className="absolute inset-0 z-20 will-change-[opacity]"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <Image
              src="/LandingPage/cena-03-bg-2-tarde.webp"
              alt="Céu ao entardecer com tons alaranjados"
              fill
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* ── Background 3: Noite (crossfade sobre a tarde) ─────────── */}
          <div
            ref={s3bg3Ref}
            className="absolute inset-0 z-30 will-change-[opacity]"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <Image
              src="/LandingPage/cena-03-bg-3-noite.webp"
              alt="Céu estrelado com Via Láctea à noite"
              fill
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* ── Overlay escuro sutil ──────────────────────────────────── */}
          <div
            className="absolute inset-0 z-40 bg-black/20"
            aria-hidden="true"
          />

          {/**
           * Falcão: sempre centralizado, z-50 dentro da Cena 3.
           * `drop-shadow` aplicado via style (segue o contorno do PNG).
           * `pointer-events-none` para não bloquear interação do usuário.
           */}
          <div
            className="absolute inset-0 z-50 flex items-center justify-center
                       pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="relative w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96"
              style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" }}
            >
              <Image
                src="/LandingPage/cena-03-ave-falcão.webp"
                alt="Falcão mensageiro carregando uma carta em voo"
                fill
                quality={95}
                className="object-contain"
              />
            </div>
          </div>

          {/* ── Texto da Cena 3 (z-50, aparece e some via timeline) ───── */}
          <div
            ref={s3TextRef}
            className="absolute bottom-0 left-0 right-0 z-50
                       pb-12 md:pb-20 px-4 md:px-8
                       pointer-events-none will-change-transform"
            style={{ opacity: 0 }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-white/60 text-[10px] md:text-xs uppercase
                            tracking-[0.25em] font-sans font-light mb-3 md:mb-4">
                A Jornada
              </p>
              <h2 className="font-serif font-semibold text-white leading-[1.1]
                             tracking-tight text-2xl md:text-4xl lg:text-5xl
                             mb-4 md:mb-5">
                Tempo real, quilômetro a quilômetro.
              </h2>
              <p className="font-sans font-light text-white/80 leading-relaxed
                            text-sm md:text-lg max-w-xl mx-auto">
                A distância física dita a regra. Sua carta viaja em tempo real,
                quilômetro a quilômetro. Uma jornada que pode durar horas ou dias…
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CENA 4 — "A Chegada" + CTA Final
            z-40: camada mais alta, encerra a narrativa.
            opacity começa em 0; GSAP faz o fade-in final.
        ═══════════════════════════════════════════════════════════ */}
        <div
          ref={s4Ref}
          className="absolute inset-0 z-40 will-change-[opacity]"
          style={{ opacity: 0 }}
          aria-label="Cena 4 — A Chegada"
        >
          {/* Imagem de fundo */}
          <div className="absolute inset-0" aria-hidden="true">
            <picture className="absolute inset-0 w-full h-full -z-10">
              <source media="(min-width: 768px)" srcSet="/LandingPage/cena-04-chegada-mesa.webp" />
              <img
                src="/LandingPage/cena-04-chegada-mesa-mobile.webp"
                alt="Mesa com carta recém-chegada, prestes a ser aberta"
                className="object-cover object-center w-full h-full"
              />
            </picture>
          </div>

          {/* Gradiente mais profundo para o encerramento */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[68%]
                       bg-gradient-to-t from-black/95 via-black/65 to-transparent"
            aria-hidden="true"
          />

          {/* Conteúdo + CTA */}
          <div className="absolute bottom-0 left-0 right-0 pb-12 md:pb-20 lg:pb-24 px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-white/60 text-[10px] md:text-xs uppercase
                            tracking-[0.25em] font-sans font-light mb-3 md:mb-4">
                A Chegada
              </p>
              <h2 className="font-serif font-semibold text-white leading-[1.1]
                             tracking-tight text-3xl md:text-5xl lg:text-[3.25rem]
                             mb-4 md:mb-6">
                Uma experiência que transforma a espera.
              </h2>
              <p className="font-sans font-light text-white/80 leading-relaxed
                            text-sm md:text-lg max-w-xl mx-auto mb-8 md:mb-12">
                Uma experiência tátil e imersiva para quem recebe.
                A espera transforma uma simples mensagem em um evento inesquecível.
              </p>

              {/* CTA Principal + Secundário */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  id="final-cta-button"
                  className="group inline-flex items-center justify-center gap-2
                             bg-white text-zinc-900 font-sans font-semibold
                             text-sm md:text-base px-10 py-4 md:px-12 md:py-5
                             rounded-full shadow-xl shadow-black/30
                             transition-all duration-300 ease-out
                             hover:bg-white/95 hover:shadow-2xl hover:scale-[1.02]
                             active:scale-[0.98] w-full sm:w-auto"
                >
                  Acessar o SendPluma
                  <span
                    className="inline-block transition-transform duration-300
                               group-hover:translate-x-1"
                    aria-hidden="true"
                  >→</span>
                </Link>

                <Link
                  href="/login"
                  id="final-cta-secondary"
                  className="text-white/60 text-sm font-sans font-light
                             hover:text-white/90 transition-colors duration-200
                             underline underline-offset-4"
                >
                  Ou saiba mais primeiro
                </Link>
              </div>

              {/* Assinatura */}
              <p className="mt-10 md:mt-14 text-white/25 text-xs font-sans tracking-wider">
                © 2026 SendPluma · Correspondências com alma
              </p>
            </div>
          </div>
        </div>

      </div>{/* /sticky viewport */}

      {/* Keyframe da animação do scroll indicator — inline, CSS puro */}
      <style>{`
        @keyframes splScrollDot {
          0%   { transform: translateY(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(450%); opacity: 0; }
        }
      `}</style>

    </div>
  );
}
