import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { Suspense, ReactNode } from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function LocaleLayoutContent({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const messages = await getMessages();

  return (
    <div lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <LocaleLayoutContent locale={locale}>{children}</LocaleLayoutContent>
    </Suspense>
  );
}
