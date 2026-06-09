// components/chat/greeting.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ScientiaLogo } from "@/components/chat/scientia-logo";

const greetings = [
  "Who are we learning with today?",
  "What are we exploring today?",
  "Ready to learn something new?",
  "What curiosity brings you here?",
  "What shall we discover together?",
  "Where shall we start today?",
  "What's on your mind?",
  "What would you like to understand?",
  "Let's dive into something great.",
  "What knowledge are you seeking?",
];

const timeBasedGreetings: Record<string, string[]> = {
  morning: [
    "Good morning! Who are we learning with today?",
    "Good morning! Ready to start the day?",
    "Good morning! What shall we explore?",
  ],
  afternoon: [
    "Good afternoon! What are we learning today?",
    "Good afternoon! What's sparking your curiosity?",
    "Good afternoon! Ready to dive in?",
  ],
  evening: [
    "Good evening! Who are we learning with tonight?",
    "Good evening! What's on your mind?",
    "Good evening! Let's explore something together.",
  ],
  night: [
    "Late night curiosity? I'm here for it.",
    "Burning the midnight oil? Let's learn.",
    "The night is young. What shall we discover?",
  ],
};

function getGreeting(): string {
  const hour = new Date().getHours();
  let timeKey: string;
  if (hour >= 5 && hour < 12) timeKey = "morning";
  else if (hour >= 12 && hour < 17) timeKey = "afternoon";
  else if (hour >= 17 && hour < 22) timeKey = "evening";
  else timeKey = "night";

  // 1 chance sur 2 d'avoir un message basé sur l'heure
  if (Math.random() > 0.5) {
    const pool = timeBasedGreetings[timeKey];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
}

export const Greeting = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 text-center"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-4">
          <ScientiaLogo className="text-foreground" size={20} />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Scientia
          </h1>
        </div>
        <p className="text-2xl text-black dark:text-white/90 md:text-3xl">
          {greeting}
        </p>
      </motion.div>
    </div>
  );
};
