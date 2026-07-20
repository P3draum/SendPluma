"use client";

import { useEffect, useRef } from "react";

export default function SystemBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: Array<{ x: number; y: number; baseX: number; baseY: number }> = [];
    const spacing = 30;
    const dotRadius = 1.2;
    const dotColor = "rgba(200, 200, 200, 0.8)";
    const repulsionRadius = 90;
    const maxDisplacement = 28;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Recreate points grid
      points = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * spacing;
          const baseY = r * spacing;
          points.push({
            x: baseX,
            y: baseY,
            baseX,
            baseY,
          });
        }
      }
    };

    // Track mouse movements on window
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Initial setup
    resizeCanvas();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw all points
      ctx.fillStyle = dotColor;
      
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.baseX;
        let targetY = p.baseY;

        if (dist < repulsionRadius) {
          const angle = Math.atan2(dy, dx);
          // Stronger repulsion the closer the mouse is
          const force = (repulsionRadius - dist) / repulsionRadius;
          targetX = p.baseX + Math.cos(angle) * force * maxDisplacement;
          targetY = p.baseY + Math.sin(angle) * force * maxDisplacement;
        }

        // Smooth easing to target position
        p.x += (targetX - p.x) * 0.12;
        p.y += (targetY - p.y) * 0.12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-50 bg-[#fafafa] overflow-hidden pointer-events-none select-none">
      {/* Camada A: Gradientes Desfocados (Estético) */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-orange-100/40 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-emerald-100/35 blur-[120px]" />

      {/* Camada B: O Canvas Interativo (Dot Grid com Física) */}
      <canvas ref={canvasRef} className="block w-full h-full opacity-65" />
    </div>
  );
}
