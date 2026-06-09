"use client";

import { useEffect, useRef } from "react";

interface PendulumSimulationProps {
  width?: number;
  height?: number;
}

export function PendulumSimulation({
  width = 800,
  height = 600,
}: PendulumSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Paramètres du pendule
    let angle = Math.PI / 3; // angle initial
    let angularVelocity = 0;
    const gravity = 0.5;
    const damping = 0.995;
    const length = 200;
    const pivotX = width / 2;
    const pivotY = 100;
    const bobRadius = 15;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Calcul de l'accélération angulaire
      const angularAcceleration = -(gravity / length) * Math.sin(angle);
      angularVelocity += angularAcceleration;
      angularVelocity *= damping;
      angle += angularVelocity;

      // Position de la masse
      const bobX = pivotX + length * Math.sin(angle);
      const bobY = pivotY + length * Math.cos(angle);

      // Dessin du fil
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dessin de la masse
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dessin du point de pivot
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        className="border border-gray-200 rounded-lg shadow-md"
        height={height}
        ref={canvasRef}
        width={width}
      />
      <p className="mt-4 text-sm text-gray-500">
        Pendule simple - Simulation physique en temps réel
      </p>
    </div>
  );
}

export default PendulumSimulation;
