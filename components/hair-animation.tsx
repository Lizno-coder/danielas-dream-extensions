"use client";

import { useEffect, useRef } from "react";

interface HairBundle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  swaySpeed: number;
  swayAmount: number;
  strandCount: number;
}

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

    // Create hair bundles (looks like strands of hair grouped together)
    const bundles: HairBundle[] = [];
    const bundleCount = window.innerWidth < 768 ? 8 : 12;
    
    for (let i = 0; i < bundleCount; i++) {
      bundles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200, // Start below screen
        width: 30 + Math.random() * 50, // Width of hair bundle
        height: 200 + Math.random() * 300, // Length
        color: `rgba(252, 239, 209, ${0.03 + Math.random() * 0.04})`,
        opacity: 0.03 + Math.random() * 0.04,
        swaySpeed: 0.0005 + Math.random() * 0.001,
        swayAmount: 10 + Math.random() * 20,
        strandCount: 5 + Math.floor(Math.random() * 8),
      });
    }

    let time = 0;
    let animationId: number;

    const drawHairBundle = (bundle: HairBundle) => {
      const sway = Math.sin(time * bundle.swaySpeed + bundle.x) * bundle.swayAmount;
      
      // Draw multiple strands in the bundle
      for (let s = 0; s < bundle.strandCount; s++) {
        const strandOffset = (s / bundle.strandCount - 0.5) * bundle.width;
        const individualSway = Math.sin(time * bundle.swaySpeed * 1.5 + s) * 5;
        
        ctx.beginPath();
        ctx.strokeStyle = bundle.color;
        ctx.lineWidth = 1 + Math.random() * 0.5;
        ctx.lineCap = "round";
        
        // Draw wavy hair strand from bottom to top
        const startX = bundle.x + strandOffset;
        const startY = bundle.y;
        
        ctx.moveTo(startX, startY);
        
        // Create wavy line upward
        const segments = 20;
        for (let i = 1; i <= segments; i++) {
          const progress = i / segments;
          const waveX = Math.sin(progress * Math.PI * 2 + time * 0.001 + s) * (5 * progress);
          const currentX = startX + sway * progress + waveX + individualSway * progress;
          const currentY = startY - bundle.height * progress;
          
          ctx.lineTo(currentX, currentY);
        }
        
        ctx.stroke();
      }
      
      // Draw connecting line at bottom (hair tie/bundle effect)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(68, 54, 44, ${bundle.opacity * 2})`;
      ctx.lineWidth = 3;
      ctx.moveTo(bundle.x - bundle.width / 2, bundle.y);
      ctx.lineTo(bundle.x + bundle.width / 2, bundle.y);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 16;

      bundles.forEach((bundle) => {
        // Slowly move bundles up and reset
        bundle.y -= 0.2;
        if (bundle.y < -bundle.height) {
          bundle.y = canvas.height + 100;
          bundle.x = Math.random() * canvas.width;
        }
        
        drawHairBundle(bundle);
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
      style={{ opacity: 0.8 }}
    />
  );
}

// Floating sparkles for magical effect
export function FloatingSparkles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#fcefd1]/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
