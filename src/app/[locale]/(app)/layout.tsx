import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { MENU_BOOT_SCRIPT } from "@/features/navigation/utils/menu-boot-script";
import { getAuthSession } from "@/lib/auth/session";
import { redirect } from "@/i18n/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const locale = await getLocale();
  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/login", locale });
    return null;
  }

  return (
    <>
      <AppShell user={session.user}>{children}</AppShell>
      <script dangerouslySetInnerHTML={{ __html: MENU_BOOT_SCRIPT }} />
    </>
  );
}
