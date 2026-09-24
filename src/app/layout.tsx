import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { THEME_BOOT_SCRIPT, THEME_COOKIE, isThemeMode } from "@/features/theme/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Next.js requires <html> and <body> in the root layout.
 * Locale is resolved via next-intl for the lang attribute.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isThemeMode(storedTheme) ? storedTheme : "light";

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
