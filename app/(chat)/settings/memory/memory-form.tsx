"use client";

import {
  Brain,
  Clock,
  HardDrive,
  Layers,
  RefreshCw,
  Shrink,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/chat/settings/shared/card";
import { CardHeader } from "@/components/chat/settings/shared/card-header";
import { Row } from "@/components/chat/settings/shared/row";
import { SectionLabel } from "@/components/chat/settings/shared/section-label";
import { Toggle } from "@/components/chat/settings/shared/toggle";
import { UsageBar } from "@/components/chat/settings/shared/usage-bar";
import { useSavePreferences } from "@/hooks/use-save-preferences";

export function MemoryForm({
  initialPreferences,
}: {
  initialPreferences: Record<string, unknown>;
}) {
  const save = useSavePreferences();

  const [shortTerm, setShortTerm] = useState(
    (initialPreferences.shortTerm as boolean) ?? true
  );
  const [shortTermLimit, setShortTermLimit] = useState(
    (initialPreferences.shortTermLimit as number) ?? 50
  );
  const [longTerm, setLongTerm] = useState(
    (initialPreferences.longTerm as boolean) ?? true
  );
  const [autoSummary, setAutoSummary] = useState(
    (initialPreferences.autoSummary as boolean) ?? true
  );
  const [compression, setCompression] = useState(
    (initialPreferences.compression as boolean) ?? false
  );
  const [compressionLevel, setCompressionLevel] = useState(
    (initialPreferences.compressionLevel as number) ?? 50
  );
  const [memoryExpiration, setMemoryExpiration] = useState(
    (initialPreferences.memoryExpiration as string) ?? "never"
  );
  const [syncMemory, setSyncMemory] = useState(
    (initialPreferences.syncMemory as boolean) ?? false
  );
  const [memoryUsed] = useState(128);
  const [memoryCapacity] = useState(512);

  const prefs = {
    shortTerm,
    shortTermLimit,
    longTerm,
    autoSummary,
    compression,
    compressionLevel,
    memoryExpiration,
    syncMemory,
  };

  return (
    <div className="space-y-8">
      <SectionLabel>Memory System</SectionLabel>

      <Card>
        <CardHeader
          title="Memory usage"
          description="Current memory consumption across all layers."
        />
        <div className="p-5 space-y-4">
          <UsageBar
            label="Total memory"
            total={memoryCapacity}
            used={memoryUsed}
          />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 text-[14px] text-neutral-500">
              <div className="size-2 rounded-full bg-blue-500" />
              Short-term: 32 MB
            </div>
            <div className="flex items-center gap-2 text-[14px] text-neutral-500">
              <div className="size-2 rounded-full bg-emerald-500" />
              Long-term: 64 MB
            </div>
            <div className="flex items-center gap-2 text-[14px] text-neutral-500">
              <div className="size-2 rounded-full bg-amber-500" />
              Project: 20 MB
            </div>
            <div className="flex items-center gap-2 text-[14px] text-neutral-500">
              <div className="size-2 rounded-full bg-violet-500" />
              Embeddings: 12 MB
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Memory layers"
          description="Configure how Orion stores and retrieves context."
        />
        <Row
          action={
            <Toggle
              checked={shortTerm}
              label="Short-term memory"
              onChange={(v) => {
                setShortTerm(v);
                save({ ...prefs, shortTerm: v });
              }}
            />
          }
          icon={Brain}
          label="Short-term memory"
          value="Recent conversation context for immediate recall"
        />
        <Row
          action={
            <Toggle
              checked={longTerm}
              label="Long-term memory"
              onChange={(v) => {
                setLongTerm(v);
                save({ ...prefs, longTerm: v });
              }}
            />
          }
          icon={HardDrive}
          label="Long-term memory"
          value="Persistent knowledge across sessions and conversations"
        />
        <Row
          action={
            <Toggle
              checked={autoSummary}
              label="Auto-summarization"
              onChange={(v) => {
                setAutoSummary(v);
                save({ ...prefs, autoSummary: v });
              }}
            />
          }
          icon={RefreshCw}
          label="Auto-summarization"
          value="Automatically compress and summarize old conversations"
        />
      </Card>

      <Card>
        <CardHeader
          title="Compression & limits"
          description="Control memory usage and retention policies."
        />
        <Row
          action={
            <Toggle
              checked={compression}
              label="Memory compression"
              onChange={(v) => {
                setCompression(v);
                save({ ...prefs, compression: v });
              }}
            />
          }
          icon={Shrink}
          label="Memory compression"
          value="Reduce memory footprint by compressing older context"
        />
        {compression && (
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">
                Compression level
              </span>
              <span className="text-[14px] tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                {compressionLevel}%
              </span>
            </div>
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
              max={90}
              min={10}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setCompressionLevel(v);
                save({ ...prefs, compressionLevel: v });
              }}
              step={10}
              type="range"
              value={compressionLevel}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[12px] text-neutral-400">Light</span>
              <span className="text-[12px] text-neutral-400">Aggressive</span>
            </div>
          </div>
        )}
        <Row
          action={
            <select
              className="rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              onChange={(e) => {
                setMemoryExpiration(e.target.value);
                save({ ...prefs, memoryExpiration: e.target.value });
              }}
              value={memoryExpiration}
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="never">Never</option>
            </select>
          }
          icon={Clock}
          label="Memory expiration"
          value="Automatically clear old memories after a set period"
        />
        <Row
          action={
            <Toggle
              checked={syncMemory}
              label="Sync memory"
              onChange={(v) => {
                setSyncMemory(v);
                save({ ...prefs, syncMemory: v });
              }}
            />
          }
          icon={Layers}
          label="Sync memory"
          value="Synchronize memory across all your sessions and devices"
        />
      </Card>

      <Card>
        <CardHeader
          title="Short-term memory limit"
          description="Maximum number of messages kept in short-term context."
        />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-neutral-600 dark:text-neutral-400">
              Messages
            </span>
            <input
              className="w-20 rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              max={200}
              min={10}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10) || 10;
                setShortTermLimit(v);
                save({ ...prefs, shortTermLimit: v });
              }}
              type="number"
              value={shortTermLimit}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
