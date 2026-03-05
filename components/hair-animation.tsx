"use client";

import { useEffect, useRef } from "react";

export function HairStrandBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Hair strand properties
    const strands: Array<{
      x: number;
      y: number;
      length: number;
      angle: number;
      speed: number;
      amplitude: number;
      color: string;
      thickness: number;
    }> = [];

    // Create strands
    const strandCount = window.innerWidth < 768 ? 15 : 25;
    for (let i = 0; i < strandCount; i++) {
      strands.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 200,
        angle: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002,
        amplitude: 20 + Math.random() * 30,
        color: `rgba(252, 239, 209, ${0.03 + Math.random() * 0.05})`,
        thickness: 1 + Math.random() * 2,
      });
    }

    let time = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      strands.forEach((strand) => {
        ctx.beginPath();
        ctx.strokeStyle = strand.color;
        ctx.lineWidth = strand.thickness;
        ctx.lineCap = "round";

        const startX = strand.x;
        const startY = strand.y;

        // Draw wavy hair strand
        for (let i = 0; i <= strand.length; i += 5) {
          const progress = i / strand.length;
          const wave = Math.sin(time * strand.speed * 1000 + progress * Math.PI * 2) * strand.amplitude * progress;
          
          const x = startX + Math.cos(strand.angle) * i + wave * Math.cos(strand.angle + Math.PI / 2);
          const y = startY + Math.sin(strand.angle) * i + wave * Math.sin(strand.angle + Math.PI / 2);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

// Floating particles for extra effect
export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#fcefd1]/10 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}
