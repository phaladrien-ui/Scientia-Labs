"use client";

import {
  FileText,
  Github,
  Link,
  Shield,
  Slack,
  Timer,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/chat/settings/shared/card";
import { Row } from "@/components/chat/settings/shared/row";
import { SectionLabel } from "@/components/chat/settings/shared/section-label";
import { Toggle } from "@/components/chat/settings/shared/toggle";

const INTEGRATIONS = [
  {
    id: "github",
    label: "GitHub",
    icon: Github,
    description: "Repositories, issues, pull requests",
  },
  {
    id: "slack",
    label: "Slack",
    icon: Slack,
    description: "Messages, channels, notifications",
  },
  {
    id: "notion",
    label: "Notion",
    icon: FileText,
    description: "Pages, databases, wikis",
  },
  {
    id: "browser",
    label: "Web Browser",
    icon: Link,
    description: "Search, scrape, navigate",
  },
  {
    id: "api",
    label: "Custom API",
    icon: Link,
    description: "Connect any REST or GraphQL API",
  },
];

export function ToolsForm({
  initialPreferences,
}: {
  initialPreferences: Record<string, unknown>;
}) {
  const router = useRouter();

  const [connectedTools, setConnectedTools] = useState<string[]>(
    (initialPreferences.connectedTools as string[]) ?? []
  );
  const [toolPermissions, setToolPermissions] = useState<
    Record<string, string>
  >((initialPreferences.toolPermissions as Record<string, string>) ?? {});
  const [toolTimeout, setToolTimeout] = useState(
    (initialPreferences.toolTimeout as number) ?? 30
  );
  const [toolQuota, setToolQuota] = useState(
    (initialPreferences.toolQuota as number) ?? 100
  );
  const [toolLogs, setToolLogs] = useState(
    (initialPreferences.toolLogs as boolean) ?? true
  );
  const [sandboxMode, setSandboxMode] = useState(
    (initialPreferences.sandboxMode as boolean) ?? true
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
    connectedTools,
    toolPermissions,
    toolTimeout,
    toolQuota,
    toolLogs,
    sandboxMode,
  };

  function toggleTool(id: string) {
    const updated = connectedTools.includes(id)
      ? connectedTools.filter((t) => t !== id)
      : [...connectedTools, id];
    setConnectedTools(updated);
    save({ ...prefs, connectedTools: updated });
  }

  function setPermission(toolId: string, level: string) {
    const updated = { ...toolPermissions, [toolId]: level };
    setToolPermissions(updated);
    save({ ...prefs, toolPermissions: updated });
  }

  return (
    <div className="space-y-8">
      <SectionLabel>Tools & Integrations</SectionLabel>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Connected integrations
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Connect external services your agents can use.
          </p>
        </div>
        {INTEGRATIONS.map((tool) => {
          const isConnected = connectedTools.includes(tool.id);
          return (
            <Row
              action={
                <button
                  className={`text-[14px] font-medium transition-colors ${
                    isConnected
                      ? "text-red-500 hover:text-red-400"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                  onClick={() => toggleTool(tool.id)}
                  type="button"
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>
              }
              icon={tool.icon}
              key={tool.id}
              label={tool.label}
              value={isConnected ? "Connected" : "Not connected"}
            />
          );
        })}
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Tool permissions
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Set access levels for each connected tool.
          </p>
        </div>
        {connectedTools.map((toolId) => {
          const tool = INTEGRATIONS.find((t) => t.id === toolId);
          if (!tool) {
            return null;
          }
          return (
            <Row
              action={
                <select
                  className="rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
                  onChange={(e) => setPermission(toolId, e.target.value)}
                  value={toolPermissions[toolId] ?? "read"}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>
              }
              icon={tool.icon}
              key={toolId}
              label={tool.label}
              value={
                toolPermissions[toolId] === "admin"
                  ? "Admin"
                  : toolPermissions[toolId] === "write"
                    ? "Write"
                    : "Read"
              }
            />
          );
        })}
        {connectedTools.length === 0 && (
          <div className="px-5 py-4 text-[14px] text-neutral-400">
            No tools connected yet. Connect a tool above to set permissions.
          </div>
        )}
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Limits & safety
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure execution boundaries for tools.
          </p>
        </div>
        <Row
          action={
            <div className="flex items-center gap-2">
              <input
                className="w-16 rounded-lg border border-neutral-200 bg-transparent px-2 py-1 text-[14px] text-neutral-900 text-right dark:border-neutral-700 dark:text-neutral-100"
                max={120}
                min={5}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 5;
                  setToolTimeout(v);
                  save({ ...prefs, toolTimeout: v });
                }}
                type="number"
                value={toolTimeout}
              />
              <span className="text-[14px] text-neutral-400">sec</span>
            </div>
          }
          icon={Timer}
          label="Execution timeout"
          value="Maximum time a tool can run before being stopped"
        />
        <Row
          action={
            <div className="flex items-center gap-2">
              <input
                className="w-20 rounded-lg border border-neutral-200 bg-transparent px-2 py-1 text-[14px] text-neutral-900 text-right dark:border-neutral-700 dark:text-neutral-100"
                max={10_000}
                min={10}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 10;
                  setToolQuota(v);
                  save({ ...prefs, toolQuota: v });
                }}
                type="number"
                value={toolQuota}
              />
              <span className="text-[14px] text-neutral-400">/day</span>
            </div>
          }
          icon={Wrench}
          label="Daily call quota"
          value="Maximum tool calls per day"
        />
        <Row
          action={
            <Toggle
              checked={sandboxMode}
              label="Sandbox mode"
              onChange={(v) => {
                setSandboxMode(v);
                save({ ...prefs, sandboxMode: v });
              }}
            />
          }
          icon={Shield}
          label="Sandbox mode"
          value="Run tools in an isolated environment for safety"
        />
        <Row
          action={
            <Toggle
              checked={toolLogs}
              label="Tool execution logs"
              onChange={(v) => {
                setToolLogs(v);
                save({ ...prefs, toolLogs: v });
              }}
            />
          }
          icon={FileText}
          label="Tool execution logs"
          value="Keep detailed logs of all tool executions"
        />
      </Card>
    </div>
  );
}
