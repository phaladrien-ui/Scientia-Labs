// components/chat/multimodal-input.tsx
"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { ArrowUpIcon, BotIcon, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActiveChat } from "@/hooks/use-active-chat";
import type { Attachment, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import { Button } from "../ui/button";
import { StopIcon } from "./icons";
import { getModeLabel, type ModeType, PlusMenu } from "./plus-menu";
import { PreviewAttachment } from "./preview-attachment";
import {
  type SlashCommand,
  SlashCommandMenu,
  slashCommands,
} from "./slash-commands";
import { SuggestedActions } from "./suggested-actions";
import { SuggestedActionsWebsites } from "./suggested-actions-websites";
import type { VisibilityType } from "./visibility-selector";

const scientiaModels = [
  { id: "fast", label: "Fast" },
  { id: "smart", label: "Smart" },
  { id: "creative", label: "Creative" },
] as const;

const placeholderMap: Record<string, string> = {
  Learn: "Teach me...",
  Solve: "Solve this for me...",
  Code: "Build me...",
};

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId: _selectedModelId,
  onModelChange: _onModelChange,
  editingMessage,
  onCancelEdit,
  isLoading,
  isWebsites,
  activeCategory,
  setActiveCategory,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage:
    | UseChatHelpers<ChatMessage>["sendMessage"]
    | (() => Promise<void>);
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  editingMessage?: ChatMessage | null;
  onCancelEdit?: () => void;
  isLoading?: boolean;
  isWebsites?: boolean;
  activeCategory?: string | null;
  setActiveCategory?: (category: string | null) => void;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const hasAutoFocused = useRef(false);
  const [mode, setMode] = useState<ModeType | null>(null);
  const [scientiaModel, setScientiaModel] = useState("fast");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const { modeRef } = useActiveChat();

  useEffect(() => {
    modeRef.current = mode;
  }, [mode, modeRef]);

  useEffect(() => {
    if (!hasAutoFocused.current && width) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        hasAutoFocused.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [width]);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );
  useEffect(() => {
    if (textareaRef.current) {
      const finalValue = textareaRef.current.value || localStorageInput || "";
      setInput(finalValue);
    }
  }, [localStorageInput, setInput]);
  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = event.target.value;
    setInput(val);
    if (val.startsWith("/") && !val.includes(" ")) {
      setSlashOpen(true);
      setSlashQuery(val.slice(1));
      setSlashIndex(0);
    } else {
      setSlashOpen(false);
    }
  };

  const handleSlashSelect = (cmd: SlashCommand) => {
    setSlashOpen(false);
    setInput("");
    switch (cmd.action) {
      case "new":
        router.push("/");
        break;
      case "clear":
        setMessages(() => []);
        break;
      case "rename":
        toast("Rename is available from the sidebar chat menu.");
        break;
      case "model":
        document
          .querySelector<HTMLButtonElement>("[data-testid='model-selector']")
          ?.click();
        break;
      case "theme":
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        break;
      case "delete":
        toast("Delete this chat?", {
          action: {
            label: "Delete",
            onClick: () => {
              fetch(
                `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/chat?id=${chatId}`,
                { method: "DELETE" }
              );
              router.push("/");
              toast.success("Chat deleted");
            },
          },
        });
        break;
      case "purge":
        toast("Delete all chats?", {
          action: {
            label: "Delete all",
            onClick: () => {
              fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, {
                method: "DELETE",
              });
              router.push("/");
              toast.success("All chats deleted");
            },
          },
        });
        break;
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const submitForm = useCallback(() => {
    window.history.pushState(
      {},
      "",
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
    );
    sendMessage({
      role: "user",
      parts: [
        ...attachments.map((a) => ({
          type: "file" as const,
          url: a.url,
          name: a.name,
          mediaType: a.contentType,
        })),
        { type: "text", text: input },
      ],
    });
    setAttachments([]);
    setLocalStorageInput("");
    setInput("");
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/files/upload`,
        { method: "POST", body: fd }
      );
      if (r.ok) {
        const d = await r.json();
        return { url: d.url, name: d.pathname, contentType: d.contentType };
      }
      toast.error((await r.json()).error);
    } catch {
      toast.error("Failed to upload file");
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setUploadQueue(files.map((f) => f.name));
      try {
        const uploaded = (await Promise.all(files.map(uploadFile))).filter(
          (a) => a !== undefined
        );
        setAttachments((c) => [...c, ...uploaded]);
      } catch {
        toast.error("Failed to upload files");
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }
      const imgs = Array.from(items).filter((i) => i.type.startsWith("image/"));
      if (!imgs.length) {
        return;
      }
      e.preventDefault();
      setUploadQueue((p) => [...p, "Pasted image"]);
      try {
        const uploaded = (
          await Promise.all(
            imgs
              .map((i) => i.getAsFile())
              .filter((f): f is File => f !== null)
              .map(uploadFile)
          )
        ).filter((a) => a?.url);
        setAttachments((c) => [...c, ...(uploaded as Attachment[])]);
      } catch {
        toast.error("Failed to upload pasted image");
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) {
      return;
    }
    ta.addEventListener("paste", handlePaste);
    return () => ta.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const placeholder = editingMessage
    ? "Edit your message..."
    : isWebsites
      ? "Describe the website you want..."
      : activeCategory
        ? placeholderMap[activeCategory] || "Ask anything..."
        : "Ask anything...";

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      {editingMessage && onCancelEdit && (
        <div className="flex items-center gap-2 text-[12px] text-black dark:text-white">
          <span>Editing message</span>
          <button
            className="rounded px-1.5 py-0.5 text-black/50 dark:text-white/50 transition-colors hover:bg-muted hover:text-black dark:hover:text-white"
            onMouseDown={(e) => {
              e.preventDefault();
              onCancelEdit();
            }}
            type="button"
          >
            Cancel
          </button>
        </div>
      )}
      <input
        className="pointer-events-none fixed -top-4 -left-4 size-0.5 opacity-0"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />
      <div className="relative">
        {slashOpen && (
          <SlashCommandMenu
            onClose={() => setSlashOpen(false)}
            onSelect={handleSlashSelect}
            query={slashQuery}
            selectedIndex={slashIndex}
          />
        )}
      </div>
      <PromptInput
        className="[&>div]:rounded-2xl [&>div]:border [&>div]:border-black/20 dark:[&>div]:border-white/15 [&>div]:bg-card/70 dark:[&>div]:bg-white/5 [&>div]:shadow-[var(--shadow-composer)] [&>div]:shadow-sm"
        onSubmit={() => {
          if (input.startsWith("/")) {
            const q = input.slice(1).trim();
            const c = slashCommands.find((x) => x.name === q);
            if (c) {
              handleSlashSelect(c);
              return;
            }
          }
          if (!input.trim() && attachments.length === 0) {
            return;
          }
          if (status === "ready" || status === "error") {
            submitForm();
          } else {
            toast.error("Please wait for the model to finish its response!");
          }
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            className="flex w-full self-start flex-row gap-2 overflow-x-auto px-3 pt-3 no-scrollbar"
            data-testid="attachments-preview"
          >
            {attachments.map((a) => (
              <PreviewAttachment
                attachment={a}
                key={a.url}
                onRemove={() => {
                  setAttachments((c) => c.filter((x) => x.url !== a.url));
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              />
            ))}
            {uploadQueue.map((f) => (
              <PreviewAttachment
                attachment={{ url: "", name: f, contentType: "" }}
                isUploading
                key={f}
              />
            ))}
          </div>
        )}
        <PromptInputTextarea
          className="min-h-24 text-[13px] leading-relaxed px-4 pt-3.5 pb-1.5 text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-white/70 caret-black dark:caret-white"
          data-testid="multimodal-input"
          onChange={handleInput}
          onKeyDown={(e) => {
            if (slashOpen) {
              const f = slashCommands.filter((c) =>
                c.name.startsWith(slashQuery.toLowerCase())
              );
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSlashIndex((i) => Math.min(i + 1, f.length - 1));
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSlashIndex((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (f[slashIndex]) {
                  handleSlashSelect(f[slashIndex]);
                }
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setSlashOpen(false);
                return;
              }
            }
            if (e.key === "Escape" && editingMessage && onCancelEdit) {
              e.preventDefault();
              onCancelEdit();
            }
          }}
          placeholder={placeholder}
          ref={textareaRef}
          value={input}
        />
        <PromptInputFooter className="px-3 pb-3">
          <PromptInputTools>
            <PlusMenu
              activeMode={mode}
              fileInputRef={fileInputRef}
              isWebsites={isWebsites}
              onModeSelect={setMode}
            />
            <Button
              className="h-7 rounded-lg px-2 text-[12px] text-black dark:text-white transition-colors hover:text-foreground gap-1.5"
              onClick={() => setMode(null)}
              variant="ghost"
            >
              <BotIcon className="size-3.5" />
              {getModeLabel(mode)}
            </Button>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <Popover onOpenChange={setModelMenuOpen} open={modelMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="h-7 rounded-lg px-2 text-[12px] text-black dark:text-white transition-colors hover:text-foreground gap-1"
                  variant="ghost"
                >
                  {scientiaModels.find((m) => m.id === scientiaModel)?.label ??
                    "Fast"}
                  <ChevronDownIcon className="size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-40 rounded-xl border border-black/20 dark:border-white/20 bg-card p-1.5 shadow-[var(--shadow-float)]"
                side="top"
                sideOffset={8}
              >
                <div className="flex flex-col gap-0.5">
                  {scientiaModels.map((m) => (
                    <button
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-muted/60 ${
                        scientiaModel === m.id
                          ? "text-foreground bg-muted/40"
                          : "text-black dark:text-white"
                      }`}
                      key={m.id}
                      onClick={() => {
                        setScientiaModel(m.id);
                        setModelMenuOpen(false);
                      }}
                      type="button"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {status === "submitted" ? (
              <StopButton setMessages={setMessages} stop={stop} />
            ) : (
              <PromptInputSubmit
                className={cn(
                  "h-7 w-7 rounded-xl transition-all duration-200",
                  input.trim()
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 active:scale-95"
                    : "bg-muted text-muted-foreground/25 cursor-not-allowed"
                )}
                data-testid="send-button"
                disabled={!input.trim() || uploadQueue.length > 0}
                status={status}
                variant="secondary"
              >
                <ArrowUpIcon className="size-4" />
              </PromptInputSubmit>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <div
        className={!isWebsites && messages.length === 0 ? "min-h-[180px]" : ""}
      >
        {!editingMessage &&
          !isLoading &&
          messages.length === 0 &&
          attachments.length === 0 &&
          uploadQueue.length === 0 &&
          (isWebsites ? (
            <SuggestedActionsWebsites sendMessage={sendMessage} />
          ) : (
            <SuggestedActions
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
              sendMessage={sendMessage}
              setActiveCategory={setActiveCategory}
            />
          ))}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prev, next) => {
  if (prev.input !== next.input) {
    return false;
  }
  if (prev.status !== next.status) {
    return false;
  }
  if (!equal(prev.attachments, next.attachments)) {
    return false;
  }
  if (prev.selectedVisibilityType !== next.selectedVisibilityType) {
    return false;
  }
  if (prev.editingMessage !== next.editingMessage) {
    return false;
  }
  if (prev.isLoading !== next.isLoading) {
    return false;
  }
  if (prev.messages.length !== next.messages.length) {
    return false;
  }
  if (prev.activeCategory !== next.activeCategory) {
    return false;
  }
  if (prev.setActiveCategory !== next.setActiveCategory) {
    return false;
  }
  return true;
});

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  return (
    <Button
      className="h-7 w-7 rounded-xl bg-foreground p-1 text-background transition-all duration-200 hover:opacity-85 active:scale-95 disabled:bg-muted disabled:text-muted-foreground/25 disabled:cursor-not-allowed"
      data-testid="stop-button"
      onClick={(e) => {
        e.preventDefault();
        stop();
        setMessages((m) => m);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}
const StopButton = memo(PureStopButton);
