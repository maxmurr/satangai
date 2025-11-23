import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "th")) {
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as "en" | "th",
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Asia/Bangkok",
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      },
      number: {
        currency: {
          style: "currency",
          currency: "THB",
        },
      },
    },
  };
});
