/** Host stored for the support project, without a scheme or path. */
export function projectDomain(value: string | null | undefined): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : raw.includes("/") ? `https://${raw}` : raw;
  const host = candidate.includes("://") ? hostnameOf(candidate) : candidate;
  return normalizeHost(host);
}

function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

function normalizeHost(host: string): string {
  const hostname = host.trim().toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname.length > 255 || hostname === "localhost") {
    return hostname === "localhost" ? hostname : "";
  }
  if (!/^[a-z0-9.-]+$/.test(hostname)) return "";
  if (hostname.startsWith(".") || hostname.endsWith(".") || hostname.includes("..")) return "";
  return hostname;
}
