// components/simulations/simulations/pendulum.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PendulumProps = {
  isRunning: boolean;
};

export function Pendulum({ isRunning }: PendulumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [angle, setAngle] = useState(0.5);
  const [length, setLength] = useState(1.5);
  const [gravity, setGravity] = useState(9.81);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pivotX = w / 2;
    const pivotY = 60;
    const bobRadius = 20;
    const l = length * 80;
    const bobX = pivotX + l * Math.sin(angle);
    const bobY = pivotY + l * Math.cos(angle);

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX - 40, pivotY);
    ctx.lineTo(pivotX + 40, pivotY);
    ctx.stroke();

    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8962f";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [angle, length]);

  const animate = useCallback(() => {
    if (!isRunning) return;
    const dt = 0.016;
    let a = angle;
    let av = 0;
    av += (-gravity / length) * Math.sin(a) * dt;
    av *= 0.999;
    a += av * dt;
    setAngle(a);
    animationRef.current = requestAnimationFrame(animate);
  }, [isRunning, angle, length, gravity]);

  useEffect(() => {
    draw();
  }, [angle, length, draw]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate]);

  return (
    <>
      <canvas
        className="rounded-xl border border-border/20 bg-white"
        height={400}
        ref={canvasRef}
        width={500}
      />
      <div className="flex items-center gap-3">
        <label className="text-[11px] text-muted-foreground">Length</label>
        <input
          className="w-20 h-1 accent-foreground"
          max="3"
          min="0.5"
          onChange={(e) => setLength(Number(e.target.value))}
          step="0.1"
          type="range"
          value={length}
        />
        <label className="text-[11px] text-muted-foreground">Gravity</label>
        <input
          className="w-20 h-1 accent-foreground"
          max="20"
          min="1"
          onChange={(e) => setGravity(Number(e.target.value))}
          step="0.1"
          type="range"
          value={gravity}
        />
      </div>
    </>
  );
}
