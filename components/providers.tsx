"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { GoeyToaster } from "goey-toast";
import "goey-toast/styles.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <GoeyToaster position="top-center" />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
