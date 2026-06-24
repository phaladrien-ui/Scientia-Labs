// components/chat/suggested-actions.tsx
"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { suggestions } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  setActiveCategory?: (category: string | null) => void;
};

function PureSuggestedActions({
  chatId,
  sendMessage,
  setActiveCategory: setActiveCategoryProp,
}: SuggestedActionsProps) {
  const t = useTranslations("chat");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const category = suggestions.find((s) => s.label === activeCategory);

  const promptKeys = useMemo(() => {
    if (!category) return [];
    const label = category.label.toLowerCase();
    return [1, 2, 3, 4].map((n) => `${label}Prompt${n}`);
  }, [category]);

  const updateCategory = (cat: string | null) => {
    setActiveCategory(cat);
    setActiveCategoryProp?.(cat);
  };

  // Phase 2
  if (activeCategory && category) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="w-full">
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-start gap-1"
            initial={{ opacity: 0 }}
          >
            {promptKeys.map((key) => (
              <button
                className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-[13px] text-black dark:text-white/90 transition-all hover:bg-card/40"
                key={key}
                onClick={() => {
                  window.history.pushState(
                    {},
                    "",
                    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
                  );
                  sendMessage({
                    role: "user",
                    parts: [{ type: "text", text: t(key) }],
                  });
                }}
                type="button"
              >
                <span className="text-black/60 dark:text-white/60">
                  <category.icon className="size-3.5" />
                </span>
                <span className="text-left">{t(key)}</span>
              </button>
            ))}
            <button
              className="mt-1 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors self-start px-3"
              onClick={() => updateCategory(null)}
              type="button"
            >
              ← {t("back")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Phase 1
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/20 dark:border-border/30 bg-card/20 px-3.5 py-1.5 text-[13px] text-black dark:text-white/90 transition-all hover:bg-card/40"
          initial={{ opacity: 0, y: 4 }}
          key={suggestion.label}
          transition={{ delay: 0.05 * index, duration: 0.3 }}
          onClick={() => updateCategory(suggestion.label)}
          type="button"
        >
          <suggestion.icon className="size-3.5 text-black/60 dark:text-white/60" />
          <span>{t(suggestion.label.toLowerCase())}</span>
        </motion.button>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prev, next) =>
    prev.chatId === next.chatId &&
    prev.selectedVisibilityType === next.selectedVisibilityType
);