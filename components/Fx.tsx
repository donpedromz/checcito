"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { playApplause, playJingle, speak, type Point } from "@/lib/fx";

const CONFETTI_COLORS = ["#FF6F59", "#8E7DBE", "#4FA972", "#F2A65A", "#E4572E", "#5FCBE0", "#FFD65C"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
};

type Clap = { id: number; x: number; y: number; delay: number };

type Fx = {
  celebrate: (big?: boolean, at?: Point | null) => void;
  toast: (msg: string) => void;
  speak: (text: string) => void;
};

const FxContext = createContext<Fx | null>(null);

export function useFx() {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error("useFx must be used inside <FxProvider>");
  return ctx;
}

export function FxProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [claps, setClaps] = useState<Clap[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clapId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        if (p.life <= 0 || p.y > window.innerHeight + 40) {
          particles.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life / 25);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const celebrate = useCallback(
    (big = false, at: Point | null = null) => {
      const x = at?.x ?? window.innerWidth / 2;
      const y = at?.y ?? window.innerHeight / 2;
      const count = big ? 90 : 22;
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: -(Math.random() * 7 + 3),
          g: 0.22,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          size: 5 + Math.random() * 5,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          life: 70 + Math.random() * 30,
        });
      }
      playApplause(big);
      if (!big) return;

      const base = ++clapId.current;
      const spawned: Clap[] = Array.from({ length: 7 }, (_, i) => ({
        id: base + i,
        x: Math.random() * (window.innerWidth - 40) + 10,
        y: window.innerHeight - 80 - Math.random() * 80,
        delay: i * 80,
      }));
      setClaps((c) => [...c, ...spawned]);
      setTimeout(
        () => setClaps((c) => c.filter((k) => !spawned.some((s) => s.id === k.id))),
        2000,
      );
      setTimeout(playJingle, 700);
      toast("¡Lograste! 🎉");
    },
    [toast],
  );

  const value = useMemo<Fx>(() => ({ celebrate, toast, speak }), [celebrate, toast]);

  return (
    <FxContext.Provider value={value}>
      {children}
      <canvas ref={canvasRef} className="fx-canvas" aria-hidden />
      {claps.map((c) => (
        <div
          key={c.id}
          className="clap-emoji"
          style={{ left: c.x, top: c.y, animationDelay: `${c.delay}ms` }}
        >
          👏
        </div>
      ))}
      <div className={`toast${toastMsg ? " show" : ""}`} role="status">
        {toastMsg}
      </div>
    </FxContext.Provider>
  );
}
