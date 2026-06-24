// components/chat/suggested-actions-websites.tsx
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  GlobeIcon,
  LayoutIcon,
  PaletteIcon,
  ShoppingCartIcon,
} from "lucide-react";

const suggestionKeys = [
  { key: "landingPage", icone: LayoutIcon, promptKey: "landingPagePrompt" },
  { key: "ecommerce", icone: ShoppingCartIcon, promptKey: "ecommercePrompt" },
  { key: "portfolio", icone: PaletteIcon, promptKey: "portfolioPrompt" },
  { key: "blog", icone: GlobeIcon, promptKey: "blogPrompt" },
];

export function SuggestedActionsWebsites({
  sendMessage,
}: {
  sendMessage: (message: {
    role: "user";
    parts: { type: "text"; text: string }[];
  }) => void;
}) {
  const t = useTranslations("chat");

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestionKeys.map((suggestion, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/20 dark:border-border/30 bg-card/20 px-3.5 py-1.5 text-[13px] text-black dark:text-white/90 transition-all hover:bg-card/40"
          initial={{ opacity: 0, y: 4 }}
          key={suggestion.key}
          transition={{ delay: 0.05 * index, duration: 0.3 }}
          onClick={() => {
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: t(suggestion.promptKey) }],
            });
          }}
          type="button"
        >
          <suggestion.icone className="size-3.5 text-black/60 dark:text-white/60" />
          <span>{t(suggestion.key)}</span>
        </motion.button>
      ))}
    </div>
  );
}