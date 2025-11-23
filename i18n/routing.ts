import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "th"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/cash-flow": {
      en: "/cash-flow",
      th: "/cash-flow",
    },
    "/tax-planner": {
      en: "/tax-planner",
      th: "/tax-planner",
    },
    "/retirement": {
      en: "/retirement",
      th: "/retirement",
    },
  },
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
