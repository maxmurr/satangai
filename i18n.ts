import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "th"] as const;

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as "en" | "th")) notFound();

  return {
    locale: locale as "en" | "th",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
