// i18n.ts
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

export default getRequestConfig(async () => {
  let locale = "en";
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    const match = cookieHeader.match(/NEXT_LOCALE=([^;]+)/);
    if (match && ["en", "fr", "zh"].includes(match[1])) {
      locale = match[1];
    }
  } catch {
    locale = "en";
  }

  console.log("i18n locale:", locale); // ← log pour debug

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});