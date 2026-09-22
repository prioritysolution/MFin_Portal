/**
 * When Laravel MenuTree leaves `route` null, map known items to app pages.
 * Prefer Laravel route when present and safe.
 */

import { sanitizeMenuRoute } from "@/features/navigation/utils/safe-menu-route";

/** Canonical Audit & Security page (matches MenuTree). */
export const AUDIT_SECURITY_ROUTE = "/security/audit-logs";

/** Canonical Fiscal Year Setup page (matches MenuTree). */
export const FISCAL_YEAR_ROUTE = "/master/fiscal-year";

/** Canonical Holiday Calendar page (matches MenuTree). */
export const HOLIDAY_CALENDAR_ROUTE = "/master/holiday-calendar";

/** Canonical Business Hours / Operational Days page (matches MenuTree). */
export const BUSINESS_HOURS_ROUTE = "/master/business-hours";

/** Stable keys: `${menuId}:${submenuId}` for children; `${menuId}` for parents. */
const MENU_ROUTE_FALLBACKS: Record<string, string> = {
  // Master Menu → Business Hours (Operational Days)
  "2:3": BUSINESS_HOURS_ROUTE,
  // Master Menu → Fiscal Year Setup
  "2:11": FISCAL_YEAR_ROUTE,
  // Master Menu → Holiday Calendar
  "2:12": HOLIDAY_CALENDAR_ROUTE,
  // User & Security → Audit & Security
  "17:6": AUDIT_SECURITY_ROUTE,
};

function fallbackKey(menuId: number, submenuId?: number | null): string {
  if (submenuId == null) return String(menuId);
  return `${menuId}:${submenuId}`;
}

/**
 * Resolve a navigable app path for a menu node/child.
 * API route wins when valid; otherwise use known local fallbacks.
 */
export function resolveMenuRoute(options: {
  route: string | null | undefined;
  menuId: number;
  submenuId?: number | null;
  name?: string | null;
}): string | null {
  const fromApi = sanitizeMenuRoute(options.route);
  if (fromApi) return fromApi;

  const byId =
    MENU_ROUTE_FALLBACKS[fallbackKey(options.menuId, options.submenuId)];
  if (byId) return byId;

  const name = (options.name ?? "").trim().toLowerCase();
  if (name === "audit & security" || name === "audit and security") {
    return AUDIT_SECURITY_ROUTE;
  }
  if (name === "fiscal year setup" || name === "fiscal year") {
    return FISCAL_YEAR_ROUTE;
  }
  if (name === "holiday calendar" || name === "holidays") {
    return HOLIDAY_CALENDAR_ROUTE;
  }
  if (
    name === "business hours" ||
    name === "operational days" ||
    name === "operational day"
  ) {
    return BUSINESS_HOURS_ROUTE;
  }

  return null;
}
