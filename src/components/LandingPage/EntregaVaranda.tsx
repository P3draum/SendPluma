"use client";

/**
 * EntregaVaranda — Cena 02: "O Despacho"
 *
 * Comportamento:
 *   - Imagem `/LandingPage/cena-02-entrega-varanda.webp` cobre a tela inteira.
 *   - Revelação suave (fade-in + translateY) ao entrar no viewport.
 *   - Parallax leve na imagem de fundo (move -5% → +5% no eixo Y).
 *   - Conteúdo textual ancorado na base, com gradiente inferior apenas.
 */

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function EntregaVaranda() {
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
      // Não usa scrub — anima uma única vez quando a seção aparece.
      gsap.fromTo(
        content,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            end: "top 45%",
            scrub: 1.5,
          },
        }
      );

      // ── Parallax suave na imagem de fundo ───────────────────────────────
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
      aria-label="Cena 2 — O Despacho: Escreva no seu ritmo"
    >
      {/* ── Imagem de fundo com parallax ────────────────────────────────── */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <picture className="absolute inset-0 w-full h-full -z-10">
          <source media="(min-width: 768px)" srcSet="/LandingPage/cena-02-entrega-varanda.webp" />
          <img
            src="/LandingPage/cena-02-entrega-varanda-mobile.webp"
            alt="Cena de entrega de carta em uma varanda ao entardecer"
            className="object-cover object-center w-full h-full"
          />
        </picture>
      </div>

      {/* ── Gradiente inferior ───────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[60%]
                   bg-gradient-to-t from-black/90 via-black/55 to-transparent"
        aria-hidden="true"
      />

      {/* ── Conteúdo textual ─────────────────────────────────────────────── */}
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
            O Despacho
          </p>

          {/* Título */}
          <h2 className="font-serif font-semibold text-white leading-[1.1] tracking-tight
                         text-3xl md:text-5xl lg:text-[3.5rem]
                         mb-4 md:mb-6">
            Escreva no seu ritmo.
          </h2>

          {/* Corpo do texto — citação do briefing */}
          <p className="font-sans font-light text-white/80 leading-relaxed
                        text-sm md:text-lg
                        max-w-xl mx-auto">
            Quando estiver pronto, confie sua mensagem aos nossos mensageiros.{" "}
            Você escolhe a ave, nós calculamos a rota.
          </p>

        </div>
      </div>
    </section>
  );
}
