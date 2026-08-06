import React, { useEffect, useRef } from 'react';
import { Sparkles, Check, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface AnatomicalAiHeroProps {
  mouseX?: number;
  mouseY?: number;
  onIntroComplete?: () => void;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Connection {
  from: number;
  to: number;
}

interface Pulse {
  connectionIdx: number;
  progress: number;
  speed: number;
  color: string;
}

interface AmbientParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

export const AnatomicalAiHero: React.FC<AnatomicalAiHeroProps> = ({ mouseX = 0, mouseY = 0, onIntroComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const x = typeof mouseX === 'number' && !isNaN(mouseX) ? mouseX : 0;
    const y = typeof mouseY === 'number' && !isNaN(mouseY) ? mouseY : 0;
    mouseRef.current = { x, y };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (onIntroComplete) {
      // Trigger card visibility immediately for fast, responsive loading
      const t = setTimeout(() => {
        onIntroComplete();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [onIntroComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 900);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate nodes
    const nodeCount = 45;
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1.8 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Generate connection pairs
    const maxDistance = 140;
    const connections: Connection[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          connections.push({ from: i, to: j });
        }
      }
    }

    // Pulses
    const pulses: Pulse[] = [];
    const pulseCount = Math.min(22, connections.length);
    for (let i = 0; i < pulseCount; i++) {
      pulses.push({
        connectionIdx: Math.floor(Math.random() * connections.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        color: Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.9)' : 'rgba(129, 140, 248, 0.9)',
      });
    }

    // Ambient floating particles
    const ambientParticles: AmbientParticle[] = [];
    for (let i = 0; i < 50; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.8 + Math.random() * 1.5,
        speedY: -0.15 - Math.random() * 0.2,
        speedX: (Math.random() - 0.5) * 0.1,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Mouse Parallax Offset
      const targetOffX = (mouseRef.current.x || 0) * 15;
      const targetOffY = (mouseRef.current.y || 0) * 15;

      // Draw subtle background glowing radial spots
      const grad1 = ctx.createRadialGradient(
        width * 0.3 + targetOffX,
        height * 0.3 + targetOffY,
        10,
        width * 0.3 + targetOffX,
        height * 0.3 + targetOffY,
        width * 0.6
      );
      grad1.addColorStop(0, 'rgba(14, 116, 144, 0.18)');
      grad1.addColorStop(0.5, 'rgba(15, 23, 42, 0.05)');
      grad1.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.75 - targetOffX,
        height * 0.7 - targetOffY,
        20,
        width * 0.75 - targetOffX,
        height * 0.7 - targetOffY,
        width * 0.5
      );
      grad2.addColorStop(0, 'rgba(30, 58, 138, 0.25)');
      grad2.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      // Draw connection lines
      ctx.lineWidth = 0.8;
      connections.forEach((conn) => {
        const n1 = nodes[conn.from];
        const n2 = nodes[conn.to];
        if (!n1 || !n2) return;

        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.18;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(n1.x + targetOffX * 0.2, n1.y + targetOffY * 0.2);
          ctx.lineTo(n2.x + targetOffX * 0.2, n2.y + targetOffY * 0.2);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const alpha = 0.3 + Math.sin(time * 2 + node.pulsePhase) * 0.15;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x + targetOffX * 0.2, node.y + targetOffY * 0.2, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw electrical pulses along connection lines
      pulses.forEach((pulse) => {
        if (pulse.connectionIdx >= connections.length) return;
        const conn = connections[pulse.connectionIdx];
        if (!conn) return;

        const n1 = nodes[conn.from];
        const n2 = nodes[conn.to];
        if (!n1 || !n2) return;

        pulse.progress += pulse.speed;
        if (pulse.progress > 1) {
          pulse.progress = 0;
          pulse.connectionIdx = Math.floor(Math.random() * connections.length);
        }

        const px = n1.x + (n2.x - n1.x) * pulse.progress + targetOffX * 0.2;
        const py = n1.y + (n2.y - n1.y) * pulse.progress + targetOffY * 0.2;

        // Glowing head
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Ambient particles
      ambientParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x + targetOffX * 0.4, p.y + targetOffY * 0.4, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 select-none overflow-hidden bg-[#0F172A] text-white">
      {/* CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* OVERLAY SOFT GRADIENT FOR READABILITY */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/40 pointer-events-none z-0" />

      {/* TOP BRANDING */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-sky-500/20 rounded-xl blur-md" />
            <img
              src="/medtrack-logo.svg"
              alt="MedTrack Logo"
              className="w-10 h-10 rounded-xl relative shadow-lg object-contain bg-[#0F172A] border border-white/10"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              MedTrack
            </h1>
            <p className="text-[10px] font-semibold text-sky-400 font-mono tracking-widest uppercase">
              Track Your Med Way
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-sky-500/20 text-xs font-mono text-sky-300 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Active Learning Network</span>
        </div>
      </div>

      {/* MIDDLE VALUE PROPOSITION SECTION */}
      <div className="relative z-10 my-auto max-w-lg space-y-6 py-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Precision Medical Student Platform</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
          Master your medical curriculum with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200">intelligent recall</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Streamline lecture coverage, QBank practice, and Leitner spaced reviews in one calm, unified workspace engineered for medical excellence.
        </p>

        {/* Feature Checkmarks */}
        <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-400">
              <Check className="w-3 h-3" />
            </div>
            <span>Automated 7-day active recall scheduling for board exams</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
              <Check className="w-3 h-3" />
            </div>
            <span>Organized organ-system modules and lecture trackers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-400">
              <Check className="w-3 h-3" />
            </div>
            <span>Predictive readiness analytics & high-yield review prompts</span>
          </div>
        </div>
      </div>

      {/* FOOTER METRICS */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>&copy; {new Date().getFullYear()} MedTrack Inc.</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> High-Yield Board Exam Standard
        </span>
      </div>
    </div>
  );
};
