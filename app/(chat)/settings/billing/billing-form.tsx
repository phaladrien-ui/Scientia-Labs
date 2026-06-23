"use client";

import {
  Brain,
  CreditCard,
  DollarSign,
  FileText,
  MessageCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/chat/settings/shared/card";
import { CardHeader } from "@/components/chat/settings/shared/card-header";
import { Row } from "@/components/chat/settings/shared/row";
import { SectionLabel } from "@/components/chat/settings/shared/section-label";
import { UsageBar } from "@/components/chat/settings/shared/usage-bar";
import { useSavePreferences } from "@/hooks/use-save-preferences";

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPrice(n: number): string {
  return n.toFixed(2);
}

export function BillingForm({
  stats,
  initialPreferences,
}: {
  stats: {
    totalChats: number;
    chatsThisMonth: number;
    totalMessages: number;
    messagesThisMonth: number;
    messagesLastHour: number;
    totalDocuments: number;
  };
  initialPreferences: Record<string, unknown>;
}) {
  const save = useSavePreferences();

  const [spendingLimit, setSpendingLimit] = useState(
    (initialPreferences.spendingLimit as number) ?? 100
  );
  const [alertThreshold, setAlertThreshold] = useState(
    (initialPreferences.alertThreshold as number) ?? 80
  );

  const tokensThisMonth = stats.messagesThisMonth * 250;
  const tokenLimit = 500_000;
  const estimatedCost = (tokensThisMonth / 1000) * 0.02;
  const storageUsed = 128;
  const storageLimit = 1024;

  return (
    <div className="space-y-8">
      <SectionLabel>Usage & Billing</SectionLabel>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-[14px] text-neutral-500">Tokens</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {formatNumber(tokensThisMonth)}
            </span>
            <span className="text-[14px] text-neutral-400">
              of {formatNumber(tokenLimit)}
            </span>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <DollarSign className="size-3.5 text-emerald-500" />
              <span className="text-[14px] text-neutral-500">Est. cost</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              ${formatPrice(estimatedCost)}
            </span>
            <span className="text-[14px] text-neutral-400">this month</span>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-3.5 text-violet-500" />
              <span className="text-[14px] text-neutral-500">Limit</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              ${spendingLimit}
            </span>
            <span className="text-[14px] text-neutral-400">per month</span>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Monthly consumption"
          description="Track your token and storage usage."
        />
        <div className="p-5 space-y-4">
          <UsageBar
            label="Tokens consumed"
            total={tokenLimit}
            used={tokensThisMonth}
          />
          <UsageBar
            label="Spending"
            total={spendingLimit}
            used={Math.round(estimatedCost)}
          />
          <UsageBar label="Storage" total={storageLimit} used={storageUsed} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Cost breakdown"
          description="Estimated costs by service."
        />
        <Row
          action={
            <span className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
              ${formatPrice(stats.messagesThisMonth * 0.005)}
            </span>
          }
          icon={MessageCircle}
          label="Messages"
          value={`${formatNumber(stats.messagesThisMonth)} messages`}
        />
        <Row
          action={
            <span className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
              ${formatPrice(storageUsed * 0.01)}
            </span>
          }
          icon={Brain}
          label="Memory storage"
          value={`${storageUsed} MB used`}
        />
        <Row
          action={
            <span className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
              ${formatPrice(stats.totalDocuments * 0.02)}
            </span>
          }
          icon={FileText}
          label="Documents"
          value={`${stats.totalDocuments} documents`}
        />
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Total estimated
          </span>
          <span className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">
            $
            {formatPrice(
              estimatedCost + storageUsed * 0.01 + stats.totalDocuments * 0.02
            )}
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Spending controls"
          description="Set limits and alerts to control costs."
        />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="size-4 text-neutral-400 shrink-0" />
            <span className="text-[14px] text-neutral-600 dark:text-neutral-400">
              Monthly spending limit
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[14px] text-neutral-400">$</span>
              <input
                className="w-20 rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 text-right dark:border-neutral-700 dark:text-neutral-100"
                max={10_000}
                min={10}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 10;
                  setSpendingLimit(v);
                  save({ spendingLimit: v, alertThreshold });
                }}
                type="number"
                value={spendingLimit}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="size-4 text-neutral-400 shrink-0" />
            <span className="text-[14px] text-neutral-600 dark:text-neutral-400">
              Alert at
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <input
                className="w-16 rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 text-right dark:border-neutral-700 dark:text-neutral-100"
                max={100}
                min={10}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 10;
                  setAlertThreshold(v);
                  save({ spendingLimit, alertThreshold: v });
                }}
                type="number"
                value={alertThreshold}
              />
              <span className="text-[14px] text-neutral-400">%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
