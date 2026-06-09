"use client";

import { Cpu, Shield, Timer, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/chat/settings/shared/card";
import { Row } from "@/components/chat/settings/shared/row";
import { SectionLabel } from "@/components/chat/settings/shared/section-label";
import { Toggle } from "@/components/chat/settings/shared/toggle";
import { UsageBar } from "@/components/chat/settings/shared/usage-bar";

export function EngineForm({
  initialPreferences,
}: {
  initialPreferences: Record<string, unknown>;
}) {
  const router = useRouter();

  const [temperature, setTemperature] = useState(
    (initialPreferences.temperature as number) ?? 0.7
  );
  const [maxContext, setMaxContext] = useState(
    (initialPreferences.maxContext as number) ?? 8000
  );
  const [deepReasoning, setDeepReasoning] = useState(
    (initialPreferences.deepReasoning as boolean) ?? false
  );
  const [speedQuality, setSpeedQuality] = useState(
    (initialPreferences.speedQuality as number) ?? 50
  );
  const [streaming, setStreaming] = useState(
    (initialPreferences.streaming as boolean) ?? true
  );
  const [repetitionPenalty, setRepetitionPenalty] = useState(
    (initialPreferences.repetitionPenalty as number) ?? 1.1
  );
  const [topP, setTopP] = useState((initialPreferences.topP as number) ?? 0.9);
  const [cacheEnabled, setCacheEnabled] = useState(
    (initialPreferences.cacheEnabled as boolean) ?? true
  );
  const [costLimit, setCostLimit] = useState(
    (initialPreferences.costLimit as number) ?? 50
  );

  async function save(data: Record<string, unknown>) {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: data }),
      });
      router.refresh();
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  const prefs = {
    temperature,
    maxContext,
    deepReasoning,
    speedQuality,
    streaming,
    repetitionPenalty,
    topP,
    cacheEnabled,
    costLimit,
  };

  return (
    <div className="space-y-8">
      <SectionLabel>Model Engine</SectionLabel>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Precision & creativity
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Control how Orion balances precision and creativity.
          </p>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">
                Temperature
              </span>
              <span className="text-[14px] tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                {temperature}
              </span>
            </div>
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
              max="2"
              min="0"
              onChange={(e) => {
                const v = Number.parseFloat(e.target.value);
                setTemperature(v);
                save({ ...prefs, temperature: v });
              }}
              step="0.1"
              type="range"
              value={temperature}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[12px] text-neutral-400">Precise</span>
              <span className="text-[12px] text-neutral-400">Creative</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">
                Speed vs Quality
              </span>
              <span className="text-[14px] tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                {speedQuality}%
              </span>
            </div>
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
              max="100"
              min="0"
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setSpeedQuality(v);
                save({ ...prefs, speedQuality: v });
              }}
              step="5"
              type="range"
              value={speedQuality}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[12px] text-neutral-400">Speed</span>
              <span className="text-[12px] text-neutral-400">Quality</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Context & sampling
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Fine-tune how Orion processes and generates responses.
          </p>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <UsageBar label="Max context" total={32_000} used={maxContext} />
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer mt-2"
              max="32000"
              min="2000"
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setMaxContext(v);
                save({ ...prefs, maxContext: v });
              }}
              step="2000"
              type="range"
              value={maxContext}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">
                Repetition penalty
              </span>
              <span className="text-[14px] tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                {repetitionPenalty}
              </span>
            </div>
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
              max="2"
              min="1"
              onChange={(e) => {
                const v = Number.parseFloat(e.target.value);
                setRepetitionPenalty(v);
                save({ ...prefs, repetitionPenalty: v });
              }}
              step="0.1"
              type="range"
              value={repetitionPenalty}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">
                Top-P (nucleus sampling)
              </span>
              <span className="text-[14px] tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                {topP}
              </span>
            </div>
            <input
              className="w-full h-1.5 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
              max="1"
              min="0"
              onChange={(e) => {
                const v = Number.parseFloat(e.target.value);
                setTopP(v);
                save({ ...prefs, topP: v });
              }}
              step="0.05"
              type="range"
              value={topP}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Features
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Enable or disable core engine capabilities.
          </p>
        </div>
        <Row
          action={
            <Toggle
              checked={deepReasoning}
              label="Deep reasoning"
              onChange={(v) => {
                setDeepReasoning(v);
                save({ ...prefs, deepReasoning: v });
              }}
            />
          }
          icon={Cpu}
          label="Deep reasoning"
          value="Multi-step reasoning for complex tasks"
        />
        <Row
          action={
            <Toggle
              checked={streaming}
              label="Streaming"
              onChange={(v) => {
                setStreaming(v);
                save({ ...prefs, streaming: v });
              }}
            />
          }
          icon={Zap}
          label="Streaming"
          value="Display responses in real-time"
        />
        <Row
          action={
            <Toggle
              checked={cacheEnabled}
              label="Response cache"
              onChange={(v) => {
                setCacheEnabled(v);
                save({ ...prefs, cacheEnabled: v });
              }}
            />
          }
          icon={Timer}
          label="Response cache"
          value="Cache frequent responses"
        />
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Cost control
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Set a monthly spending limit for compute.
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-neutral-400 shrink-0" />
            <span className="text-[14px] text-neutral-600 dark:text-neutral-400">
              Monthly compute limit
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[14px] text-neutral-400">$</span>
              <input
                className="w-20 rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 text-right dark:border-neutral-700 dark:text-neutral-100"
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 0;
                  setCostLimit(v);
                  save({ ...prefs, costLimit: v });
                }}
                type="number"
                value={costLimit}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
