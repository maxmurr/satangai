"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Menu, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/cash-flow"
            className={`text-sm font-medium transition-colors ${
              isActive("/cash-flow")
                ? "text-foreground"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("cashFlow")}
          </Link>
          <Link
            href="/tax-planner"
            className={`text-sm font-medium transition-colors ${
              isActive("/tax-planner")
                ? "text-foreground"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("taxPlanner")}
          </Link>
          <Link
            href="/retirement"
            className={`text-sm font-medium transition-colors ${
              isActive("/retirement")
                ? "text-foreground"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("retirement")}
          </Link>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher />
          <ThemeSwitcher />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background/50 backdrop-blur">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-3">
            <Link
              href="/cash-flow"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/cash-flow")
                  ? "bg-primary/10 text-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("cashFlow")}
            </Link>
            <Link
              href="/tax-planner"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/tax-planner")
                  ? "bg-primary/10 text-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("taxPlanner")}
            </Link>
            <Link
              href="/retirement"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/retirement")
                  ? "bg-primary/10 text-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("retirement")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
