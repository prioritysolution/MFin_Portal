/**
 * Persist MenuTree in localStorage for instant sidebar paint.
 * Not secrets — cleared on logout / unauthorized.
 * Cached per user + org + lang so language switches refetch labels.
 */

import type { MenuTreeNode } from "@/features/navigation/types/menu";
import { resolveMenuRoute } from "@/features/navigation/utils/menu-route-fallbacks";
import { normalizeMenuLang } from "@/features/navigation/utils/menu-lang";

const STORAGE_KEY = "mfin.menu.v2";

type StoredMenuPayload = {
  version: 2;
  userId: number;
  orgId: number;
  lang: string;
  updatedAt: number;
  items: MenuTreeNode[];
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeMenuTree(items: MenuTreeNode[]): MenuTreeNode[] {
  return items.map((node) => ({
    ...node,
    route: resolveMenuRoute({
      route: node.route,
      menuId: node.menuId,
      name: node.name,
    }),
    children: node.children.map((child) => ({
      ...child,
      route: resolveMenuRoute({
        route: child.route,
        menuId: child.menuId,
        submenuId: child.submenuId,
        name: child.name,
      }),
    })),
  }));
}

function isMenuNode(value: unknown): value is MenuTreeNode {
  if (typeof value !== "object" || value === null) return false;
  const node = value as Partial<MenuTreeNode>;
  return (
    typeof node.id === "number" &&
    typeof node.menuId === "number" &&
    typeof node.name === "string" &&
    Array.isArray(node.children)
  );
}

function parseStored(raw: string | null): StoredMenuPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredMenuPayload>;
    if (
      parsed.version !== 2 ||
      typeof parsed.userId !== "number" ||
      typeof parsed.orgId !== "number" ||
      typeof parsed.lang !== "string" ||
      !Array.isArray(parsed.items) ||
      !parsed.items.every(isMenuNode)
    ) {
      return null;
    }
    return {
      version: 2,
      userId: parsed.userId,
      orgId: parsed.orgId,
      lang: normalizeMenuLang(parsed.lang),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
      items: sanitizeMenuTree(parsed.items),
    };
  } catch {
    return null;
  }
}

/** Stable fingerprint for change detection (order-sensitive, matches API order). */
export function menuFingerprint(items: MenuTreeNode[]): string {
  return JSON.stringify(items);
}

export function menusEqual(a: MenuTreeNode[], b: MenuTreeNode[]): boolean {
  return menuFingerprint(a) === menuFingerprint(b);
}

export function readStoredMenu(
  userId: number,
  orgId: number,
  lang?: string | null,
): MenuTreeNode[] | null {
  if (!canUseStorage()) return null;
  const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) return null;
  const expectedLang = normalizeMenuLang(lang);
  if (
    stored.userId !== userId ||
    stored.orgId !== orgId ||
    stored.lang !== expectedLang
  ) {
    return null;
  }
  return stored.items;
}

export function writeStoredMenu(
  userId: number,
  orgId: number,
  items: MenuTreeNode[],
  lang?: string | null,
): void {
  if (!canUseStorage()) return;
  const payload: StoredMenuPayload = {
    version: 2,
    userId,
    orgId,
    lang: normalizeMenuLang(lang),
    updatedAt: Date.now(),
    items: sanitizeMenuTree(items),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — ignore; memory cache still works.
  }
}

export function clearStoredMenu(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    // Drop legacy v1 key if present.
    window.localStorage.removeItem("mfin.menu.v1");
  } catch {
    // ignore
  }
}
