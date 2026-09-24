const PREFERENCE_COOKIE = "mfin_remember_device";
const LOGIN_COOKIE = "mfin_remembered_login";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type RememberedLogin = {
  remember: boolean;
  login: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const row = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!row) return null;
  try {
    return decodeURIComponent(row.slice(prefix.length));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  writeCookie(name, "", 0);
}

/** Saved on this browser only. Never stores a password or session token. */
export function readRememberedLogin(): RememberedLogin | null {
  const preference = readCookie(PREFERENCE_COOKIE);
  const login = (readCookie(LOGIN_COOKIE) ?? "").trim();
  if (preference == null && !login) return null;
  const remember = preference == null ? Boolean(login) : preference === "1";
  return { remember, login: remember ? login : "" };
}

export function saveRememberedLogin(remember: boolean, login = ""): void {
  if (typeof document === "undefined") return;
  writeCookie(PREFERENCE_COOKIE, remember ? "1" : "0", ONE_YEAR_SECONDS);
  const name = login.trim();
  if (remember && name) {
    writeCookie(LOGIN_COOKIE, name, ONE_YEAR_SECONDS);
    return;
  }
  clearCookie(LOGIN_COOKIE);
}
