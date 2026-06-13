// components/chat/suggested-actions.tsx
"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useState } from "react";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const category = suggestions.find((s) => s.label === activeCategory);
  const activePrompts = category?.prompts || [];

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
            {activePrompts.slice(0, 4).map((prompt) => (
              <button
                className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-[13px] text-black dark:text-white/90 transition-all hover:bg-card/40"
                key={prompt}
                onClick={() => {
                  window.history.pushState(
                    {},
                    "",
                    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
                  );
                  sendMessage({
                    role: "user",
                    parts: [{ type: "text", text: prompt }],
                  });
                  updateCategory(null);
                }}
                type="button"
              >
                <category.icon className="size-4 shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
            <button
              className="text-[12px] text-black/50 hover:text-black mt-1"
              onClick={() => updateCategory(null)}
              type="button"
            >
              ← Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Phase 1
  return (
    <div
      className="flex justify-center gap-12 w-full pb-1"
      data-testid="suggested-actions"
    >
      {suggestions.slice(0, 3).map((suggestion, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 flex items-center gap-2 rounded-xl border border-black/20 dark:border-border/50 bg-card/30 px-6 py-2.5 text-[13px] font-medium text-black dark:text-white/90 transition-all hover:bg-card/50"
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          key={suggestion.label}
          onClick={() => updateCategory(suggestion.label)}
          transition={{
            delay: 0.04 * index,
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          type="button"
        >
          <suggestion.icon className="size-4 shrink-0" />
          <span>{suggestion.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    return true;
  }
);
