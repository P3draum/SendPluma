"use client";

/**
 * JornadaVoo — Cena 03: "O Tempo Real"
 *
 * Esta é a seção mais complexa da página — usa `pin: true` no ScrollTrigger.
 *
 * Comportamento:
 *   - A seção fica "presa" (pinada) enquanto o usuário rola ~200vh de scroll.
 *   - Durante o pin, 3 backgrounds sofrem crossfade em sequência:
 *       Dia → Tarde → Noite (simulando o passar do tempo da jornada)
 *   - O falcão permanece estático e centralizado em todo momento (z-50).
 *   - O texto de copy aparece no início do pin e desaparece ao final.
 *
 * Estrutura de z-index:
 *   z-10: bg-1-dia    (base, sempre visível)
 *   z-20: bg-2-tarde  (fade-in sobre o dia)
 *   z-30: bg-3-noite  (fade-in sobre a tarde)
 *   z-40: overlay gradiente sutil
 *   z-50: falcão + texto
 *
 * Timeline GSAP (total 2 unidades → end: "+=200%"):
 *   0.0 – 0.3:  texto faz fade-in
 *   0.0 – 1.0:  bg-tarde faz fade-in (dia → tarde)
 *   1.0 – 2.0:  bg-noite faz fade-in (tarde → noite)
 *   1.6 – 2.0:  texto faz fade-out
 */

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function JornadaVoo() {
  /** Elemento que será pinado pelo GSAP. Deve ser uma referência ao container raiz. */
  const sectionRef = useRef<HTMLElement>(null);

  /** Background 2 — Tarde (começa com opacity: 0) */
  const bg2Ref = useRef<HTMLDivElement>(null);

  /** Background 3 — Noite (começa com opacity: 0) */
  const bg3Ref = useRef<HTMLDivElement>(null);

  /** Bloco de texto que aparece e desaparece durante o pin */
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg2 = bg2Ref.current;
      const bg3 = bg3Ref.current;
      const text = textRef.current;
      if (!section || !bg2 || !bg3 || !text) return;

      // ── Timeline principal vinculada ao ScrollTrigger com pin ────────────
      //
      // `end: "+=200%"` reserva 2 viewports de scroll para esta animação.
      // GSAP cria automaticamente um espaçador para manter o flow do documento.
      // `scrub: 1` adiciona 1 segundo de lag para suavidade cinematográfica.
      //
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          // `anticipatePin: 1` reduz o "pulo" visual ao entrar na seção pinada
          anticipatePin: 1,
        },
      });

      // ── Crossfade 1: Dia → Tarde (posição 0 a 1 na timeline) ────────────
      tl.fromTo(bg2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 1 }, 0);

      // ── Crossfade 2: Tarde → Noite (posição 1 a 2 na timeline) ──────────
      tl.fromTo(bg3, { opacity: 0 }, { opacity: 1, ease: "none", duration: 1 }, 1);

      // ── Texto: fade-in no início, fade-out no final ─────────────────────
      tl.fromTo(
        text,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 },
        0.1 // começa cedo no timeline
      );
      tl.to(
        text,
        { opacity: 0, y: -25, ease: "power2.in", duration: 0.4 },
        1.6 // desaparece nos últimos 20% do pin
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden"
      aria-label="Cena 3 — A Jornada: O falcão em voo pelo tempo"
    >
      {/* ── Background 1: Dia (base permanente) ─────────────────────────── */}
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

      {/* ── Background 2: Tarde (crossfade sobre o dia) ──────────────────── */}
      <div
        ref={bg2Ref}
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

      {/* ── Background 3: Noite (crossfade sobre a tarde) ────────────────── */}
      <div
        ref={bg3Ref}
        className="absolute inset-0 z-30 will-change-[opacity]"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <Image
          src="/LandingPage/cena-03-bg-3-noite.webp"
          alt="Céu estrelado à noite"
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ── Overlay escuro sutil para garantir contraste do texto ─────────── */}
      <div
        className="absolute inset-0 z-40 bg-black/20"
        aria-hidden="true"
      />

      {/* ── Falcão: estático no centro, mais alto que tudo ─────────────────
          Posicionado com absolute inset-0 + flex centering.
          O container tem `pointer-events-none` para não bloquear cliques.
          `drop-shadow` segue a forma da imagem se for PNG/WebP com alpha.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96"
          style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" }}
        >
          <Image
            src="/LandingPage/cena-03-ave-falcão.webp"
            alt="Falcão mensageiro em pleno voo"
            fill
            quality={95}
            sizes="(max-width: 768px) 12rem, (max-width: 1024px) 20rem, 24rem"
            className="object-contain"
          />
        </div>
      </div>

      {/* ── Texto de copy — aparece e desaparece com a timeline ─────────── */}
      <div
        ref={textRef}
        className="absolute bottom-0 left-0 right-0 z-50
                   pb-12 md:pb-20
                   px-4 md:px-8
                   will-change-transform
                   pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="max-w-2xl mx-auto text-center">

          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.25em]
                        font-sans font-light mb-3 md:mb-4">
            A Jornada
          </p>

          <h2 className="font-serif font-semibold text-white leading-[1.1] tracking-tight
                         text-2xl md:text-4xl lg:text-5xl
                         mb-4 md:mb-5">
            Tempo real, quilômetro a quilômetro.
          </h2>

          <p className="font-sans font-light text-white/80 leading-relaxed
                        text-sm md:text-lg
                        max-w-xl mx-auto">
            A distância física dita a regra. Sua carta viaja em tempo real,
            quilômetro a quilômetro. Uma jornada que pode durar horas ou dias...
          </p>

        </div>
      </div>
    </section>
  );
}
