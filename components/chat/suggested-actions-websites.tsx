// components/chat/suggested-actions-websites.tsx
"use client";

import { motion } from "framer-motion";
import {
  GlobeIcon,
  LayoutIcon,
  PaletteIcon,
  ShoppingCartIcon,
} from "lucide-react";

const suggestions = [
  {
    titre: "Landing page",
    icone: LayoutIcon,
    prompt: "Crée une landing page élégante pour une montre de luxe",
  },
  {
    titre: "E-commerce",
    icone: ShoppingCartIcon,
    prompt: "Crée un site e-commerce avec produits et panier",
  },
  {
    titre: "Portfolio",
    icone: PaletteIcon,
    prompt: "Crée un portfolio moderne pour un photographe",
  },
  {
    titre: "Blog",
    icone: GlobeIcon,
    prompt: "Crée un blog élégant avec des articles",
  },
];

export function SuggestedActionsWebsites({
  sendMessage,
}: {
  sendMessage: (message: {
    role: "user";
    parts: { type: "text"; text: string }[];
  }) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/20 dark:border-border/30 bg-card/20 px-3.5 py-1.5 text-[13px] text-black dark:text-white/90 transition-all hover:bg-card/40"
          initial={{ opacity: 0, y: 4 }}
          key={suggestion.titre}
          onClick={() => {
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: suggestion.prompt }],
            });
          }}
          transition={{ delay: 0.05 * index, duration: 0.25 }}
        >
          <suggestion.icone className="size-3.5" />
          {suggestion.titre}
        </motion.button>
      ))}
    </div>
  );
}
