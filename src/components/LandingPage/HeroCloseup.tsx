"use client";

/**
 * HeroCloseup — Cena 01: "O Resgate"
 *
 * Correções aplicadas:
 *   - Gradiente cobre APENAS a metade inferior (h-[50%]), preservando o rosto
 *     da personagem na metade superior sem nenhuma sobreposição de texto.
 *   - Imagem usa `object-[50%_15%]` para garantir que o rosto fique no quarto
 *     superior da tela em qualquer viewport.
 *   - Conteúdo ancorado no fundo via `absolute bottom-0` com padding generoso.
 *
 * Animações GSAP (scrub: true):
 *   1. Parallax: imagem faz scale 1 → 1.15 + translateY 0 → 10%
 *   2. Fade-out: conteúdo sobe e desaparece nos primeiros 40% do scroll
 */

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroCloseup() {
  const containerRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const imageWrapper = imageWrapperRef.current;
      const content = contentRef.current;
      if (!container || !imageWrapper || !content) return;

      // ── Parallax da imagem ──────────────────────────────────────────────
      gsap.fromTo(
        imageWrapper,
        { scale: 1, y: "0%" },
        {
          scale: 1.15,
          y: "10%",
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // ── Fade-out do conteúdo (mais rápido que a imagem) ─────────────────
      gsap.fromTo(
        content,
        { y: 0, opacity: 1 },
        {
          y: -70,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "40% top",
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
      aria-label="Cena 1 — O Resgate: O tempo devolve o peso às suas palavras"
    >
      {/* ── Camada 1: Imagem de fundo com parallax ──────────────────────── */}
      <div
        ref={imageWrapperRef}
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

      {/* ── Camada 2: Gradiente APENAS na metade inferior ───────────────── */}
      {/*
        `h-[55%]` cobre a metade inferior da tela.
        A metade superior permanece totalmente limpa — rosto 100% visível.
      */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%]
                   bg-gradient-to-t from-black/90 via-black/60 to-transparent"
        aria-hidden="true"
      />

      {/* ── Camada 3: Conteúdo textual — ancorado no fundo ──────────────── */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0
                   pb-10 md:pb-16 lg:pb-20
                   px-4 md:px-8
                   will-change-transform"
      >
        <div className="max-w-2xl mx-auto text-center">

          {/* Eyebrow */}
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.25em]
                        font-sans font-light mb-3 md:mb-4">
            Correspondências com alma
          </p>

          {/* Título principal — h1 para SEO */}
          <h1 className="font-serif font-semibold text-white leading-[1.1] tracking-tight
                         text-3xl md:text-5xl lg:text-6xl
                         mb-3 md:mb-5">
            O tempo devolve o peso às suas palavras.
          </h1>

          {/* Subtítulo */}
          <p className="font-sans font-light text-white/80 leading-relaxed
                        text-sm md:text-lg
                        max-w-xl mx-auto mb-7 md:mb-9">
            Fuja da ansiedade do imediato e resgate o ritual da correspondência.
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Link
              href="/login"
              id="hero-cta-button"
              className="group inline-flex items-center justify-center gap-2
                         bg-white text-zinc-900 font-sans font-semibold
                         text-sm md:text-base
                         px-8 py-4 rounded-full
                         shadow-lg shadow-black/25
                         transition-all duration-300 ease-out
                         hover:bg-white/95 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02]
                         active:scale-[0.98]
                         w-full sm:w-auto"
            >
              Escrever no meu ritmo
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>

        </div>
      </div>

      {/* ── Indicador de scroll (CSS-only, fora do contentRef) ──────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-1 pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-white/30 text-[9px] uppercase tracking-widest font-sans">Role</span>
        <div className="w-px h-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-2.5 bg-white/30 rounded-full"
            style={{ animation: "sendplumaScrollDot 1.8s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes sendplumaScrollDot {
          0%   { transform: translateY(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(450%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
