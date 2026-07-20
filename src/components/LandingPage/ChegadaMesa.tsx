"use client";

/**
 * ChegadaMesa — Cena 04: "A Chegada"
 *
 * Última cena da narrativa scrollytelling. Encerra a jornada com:
 *   - Imagem `cena-04-chegada-mesa.webp` cobrindo a tela.
 *   - Revelação suave do conteúdo ao entrar no viewport.
 *   - CTA final "Acessar o SendPluma" — botão premium que leva ao app.
 *   - Parallax leve na imagem de fundo.
 */

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ChegadaMesa() {
  const containerRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const imageWrapper = imageWrapperRef.current;
      const content = contentRef.current;
      if (!container || !imageWrapper || !content) return;

      // ── Revelação do conteúdo ao entrar no viewport ──────────────────────
      gsap.fromTo(
        content,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 75%",
            end: "top 40%",
            scrub: 1.5,
          },
        }
      );

      // ── Parallax na imagem de fundo ──────────────────────────────────────
      gsap.fromTo(
        imageWrapper,
        { y: "-5%" },
        {
          y: "5%",
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] overflow-hidden"
      aria-label="Cena 4 — A Chegada: Uma experiência que transforma a espera"
    >
      {/* ── Imagem de fundo com parallax ────────────────────────────────── */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <picture className="absolute inset-0 w-full h-full -z-10">
          <source media="(min-width: 768px)" srcSet="/LandingPage/cena-04-chegada-mesa.webp" />
          <img
            src="/LandingPage/cena-04-chegada-mesa-mobile.webp"
            alt="Mesa com carta recém-chegada, prestes a ser aberta"
            className="object-cover object-center w-full h-full"
          />
        </picture>
      </div>

      {/* ── Gradiente inferior mais profundo (cena de encerramento) ─────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[65%]
                   bg-gradient-to-t from-black/95 via-black/65 to-transparent"
        aria-hidden="true"
      />

      {/* ── Conteúdo textual + CTA ───────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0
                   pb-12 md:pb-20 lg:pb-24
                   px-4 md:px-8
                   will-change-transform"
      >
        <div className="max-w-2xl mx-auto text-center">

          {/* Eyebrow */}
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.25em]
                        font-sans font-light mb-3 md:mb-4">
            A Chegada
          </p>

          {/* Título */}
          <h2 className="font-serif font-semibold text-white leading-[1.1] tracking-tight
                         text-3xl md:text-5xl lg:text-[3.25rem]
                         mb-4 md:mb-6">
            Uma experiência que transforma a espera.
          </h2>

          {/* Corpo */}
          <p className="font-sans font-light text-white/80 leading-relaxed
                        text-sm md:text-lg
                        max-w-xl mx-auto mb-8 md:mb-12">
            Uma experiência tátil e imersiva para quem recebe.
            A espera transforma uma simples mensagem em um evento inesquecível.
          </p>

          {/* ── CTA Final ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            {/* Botão principal */}
            <Link
              href="/login"
              id="final-cta-button"
              className="group inline-flex items-center justify-center gap-2
                         bg-white text-zinc-900 font-sans font-semibold
                         text-sm md:text-base
                         px-10 py-4 md:px-12 md:py-5
                         rounded-full
                         shadow-xl shadow-black/30
                         transition-all duration-300 ease-out
                         hover:bg-white/95 hover:shadow-2xl hover:shadow-black/40 hover:scale-[1.02]
                         active:scale-[0.98]
                         w-full sm:w-auto"
            >
              Acessar o SendPluma
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

            {/* Link secundário — alternativa mais discreta */}
            <Link
              href="/login"
              id="final-cta-secondary"
              className="text-white/60 text-sm font-sans font-light
                         hover:text-white/90
                         transition-colors duration-200
                         underline underline-offset-4"
            >
              Ou saiba mais primeiro
            </Link>

          </div>

          {/* Assinatura de rodapé */}
          <p className="mt-10 md:mt-14 text-white/30 text-xs font-sans tracking-wide">
            © 2026 SendPluma · Correspondências com alma
          </p>

        </div>
      </div>
    </section>
  );
}
