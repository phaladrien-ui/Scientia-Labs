"use client";

import {
  AtSign,
  Calendar,
  Clock,
  Globe,
  Monitor,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { Card } from "@/components/chat/settings/shared/card";
import { Row } from "@/components/chat/settings/shared/row";
import { SectionLabel } from "@/components/chat/settings/shared/section-label";
import { useIntl } from "@/components/intl-provider";

function formatTimezoneLabel(tz: string): string {
  const offset =
    Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  const country = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

  if (country === "UTC" || country === "Etc") {
    return "UTC — Temps universel";
  }

  return `${offset} — ${country}`;
}

function Lightbox({
  alt,
  onClose,
  src,
}: {
  alt: string;
  onClose: () => void;
  src: string;
}) {
  return (
    <button
      aria-label="Close lightbox"
      className="fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm p-8 w-full cursor-default"
      onClick={onClose}
      type="button"
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
        onClick={onClose}
        type="button"
      >
        <X className="size-5" />
      </button>
      <span className="mt-[10vh] w-64 h-64 rounded-2xl overflow-hidden shadow-2xl pointer-events-none">
        <Image
          alt={alt}
          className="h-full w-full object-cover"
          height={256}
          src={src}
          width={256}
        />
      </span>
    </button>
  );
}

export function GeneralForm({
  initialPreferences,
  user,
}: {
  initialPreferences: Record<string, unknown>;
  user: {
    bio: string | null;
    createdAt: string | null;
    email: string;
    id: string;
    image: string | null;
    name: string;
  };
}) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { formatDate, locale, timezone } = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(user.bio ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [name, setName] = useState(user.name ?? "");

  async function savePrefs(data: Record<string, unknown>) {
    try {
      await fetch("/api/settings", {
        body: JSON.stringify({ preferences: data }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      router.refresh();
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  async function saveProfile(fields: {
    bio?: string;
    image?: string;
    name?: string;
  }) {
    try {
      await fetch("/api/settings", {
        body: JSON.stringify(fields),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      router.refresh();
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);
      await saveProfile({ image: dataUrl });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setImage("");
    saveProfile({ image: "" });
  }

  return (
    <div className="space-y-8">
      <SectionLabel>General</SectionLabel>

      {/* Profile */}
      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Profile
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your photo, name, and bio.
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <div className="relative group">
                {isUploading ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                ) : image ? (
                  <button
                    aria-label="View photo"
                    className="block h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-700 hover:ring-neutral-400 dark:hover:ring-neutral-500 transition-all cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                    type="button"
                  >
                    <Image
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      height={80}
                      src={image}
                      width={80}
                    />
                  </button>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                    <Upload className="size-5" />
                  </div>
                )}
                <button
                  aria-label="Upload photo"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="size-3.5" />
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  type="file"
                />
              </div>
              <button
                className="mt-2 text-[14px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Change
              </button>
              {image && (
                <button
                  className="mt-1 block text-[14px] text-red-500 hover:text-red-400 transition-colors"
                  onClick={handleRemovePhoto}
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[16px] font-semibold text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingName(false);
                        saveProfile({ name });
                      }
                      if (e.key === "Escape") {
                        setName(user.name ?? "");
                        setIsEditingName(false);
                      }
                    }}
                    placeholder="Your name"
                    value={name}
                  />
                  <button
                    className="text-[14px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors shrink-0"
                    onClick={() => {
                      setIsEditingName(false);
                      saveProfile({ name });
                    }}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  onClick={() => setIsEditingName(true)}
                  type="button"
                >
                  <p className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {name || "Set your name"}
                  </p>
                  <Pencil className="size-3.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity dark:text-neutral-600" />
                </button>
              )}
              <p className="mt-0.5 flex items-center gap-1.5 text-[16px] text-neutral-500 dark:text-neutral-400">
                <AtSign className="size-3 shrink-0" />
                {user.email ?? "—"}
              </p>
              {isEditingBio ? (
                <div className="mt-2 flex items-start gap-2">
                  <textarea
                    autoFocus
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[16px] text-neutral-600 placeholder:text-neutral-400 resize-none dark:border-neutral-700 dark:text-neutral-400 dark:placeholder:text-neutral-500"
                    onChange={(e) => setBio(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setBio(user.bio ?? "");
                        setIsEditingBio(false);
                      }
                    }}
                    placeholder="Write a short bio…"
                    rows={2}
                    value={bio}
                  />
                  <button
                    className="text-[14px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors shrink-0 mt-1.5"
                    onClick={() => {
                      setIsEditingBio(false);
                      saveProfile({ bio });
                    }}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  className="group mt-1.5 block w-full text-left"
                  onClick={() => setIsEditingBio(true)}
                  type="button"
                >
                  <p className="text-[16px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {bio || "Add a bio…"}
                  </p>
                </button>
              )}
            </div>
          </div>
          {lightboxOpen && image && (
            <Lightbox
              alt="Avatar"
              onClose={() => setLightboxOpen(false)}
              src={image}
            />
          )}
        </div>
        <Row
          icon={Calendar}
          label="Member since"
          value={formatDate(user.createdAt ?? null)}
        />
      </Card>

      {/* Localization */}
      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Localization
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Detected from your system.
          </p>
        </div>
        <Row
          icon={Globe}
          label="Language"
          value={
            locale === "fr" ? "Français" : locale === "en" ? "English" : locale
          }
        />
        <Row
          icon={Clock}
          label="Timezone"
          value={formatTimezoneLabel(timezone)}
        />
      </Card>

      {/* Appearance */}
      <Card>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
            Appearance
          </h3>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Choose how Orion looks.
          </p>
        </div>
        <Row
          action={
            <select
              className="rounded-lg border border-neutral-200 bg-transparent px-2.5 py-1.5 text-[14px] text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              onChange={(e) => {
                setTheme(e.target.value);
                savePrefs({
                  language: locale,
                  theme: e.target.value,
                  timezone,
                });
              }}
              value={theme}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          }
          icon={Monitor}
          label="Theme"
          value={
            theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"
          }
        />
      </Card>
    </div>
  );
}
