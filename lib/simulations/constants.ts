// lib/simulations/constants.ts
import type { SimulationCard } from "./types";

export const CATEGORIES = [
  {
    id: "physics" as const,
    label: "Physics",
    description: "Mechanics, waves, electromagnetism",
    icon: "⚛️",
  },
  {
    id: "chemistry" as const,
    label: "Chemistry",
    description: "Reactions, equilibrium, kinetics",
    icon: "🧪",
  },
  {
    id: "biology" as const,
    label: "Biology",
    description: "Population, ecosystems, genetics",
    icon: "🧬",
  },
  {
    id: "math" as const,
    label: "Mathematics",
    description: "Functions, geometry, probability",
    icon: "📐",
  },
  {
    id: "computer-science" as const,
    label: "Computer Science",
    description: "Algorithms, data structures, AI",
    icon: "💻",
  },
];

export const DEFAULT_SIMULATIONS: Record<string, SimulationCard[]> = {
  physics: [
    {
      id: "pendulum",
      title: "Simple Pendulum",
      type: "pendulum",
      description:
        "Simulate the motion of a pendulum with adjustable length and gravity",
      icon: "🕐",
    },
    {
      id: "projectile",
      title: "Projectile Motion",
      type: "projectile",
      description: "Launch a projectile with initial velocity and angle",
      icon: "🎯",
    },
    {
      id: "wave",
      title: "Wave Propagation",
      type: "wave",
      description: "Visualize transverse and longitudinal waves",
      icon: "〰️",
    },
  ],
  chemistry: [
    {
      id: "chemical-reaction",
      title: "Chemical Reaction",
      type: "chemical-reaction",
      description: "Simulate reaction rates and equilibrium",
      icon: "⚗️",
    },
  ],
  biology: [
    {
      id: "population-growth",
      title: "Population Growth",
      type: "population-growth",
      description: "Model exponential and logistic population growth",
      icon: "📈",
    },
  ],
  math: [],
  "computer-science": [],
};
