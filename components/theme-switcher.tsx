"use client";

import { useTheme } from "next-themes";
import { useTransition, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    startTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  }

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md border border-border p-2 hover:bg-muted transition-colors"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md border border-border p-2 hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
