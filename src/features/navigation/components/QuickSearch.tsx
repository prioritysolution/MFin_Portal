"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { CornerDownLeft, Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AuthUser } from "@/features/auth/types/auth";
import {
  fetchMenuClient,
  getStoredMenuForUser,
} from "@/features/navigation/services/menu-client";
import { toMenuLang } from "@/features/navigation/utils/menu-lang";
import {
  buildQuickSearchCatalog,
  filterQuickSearchItems,
  type QuickSearchItem,
} from "@/features/navigation/utils/build-quick-search-items";

type QuickSearchProps = {
  user: AuthUser;
  className?: string;
  showShortcut?: boolean;
};

export function QuickSearch({
  user,
  className = "",
  showShortcut = true,
}: QuickSearchProps) {
  const t = useTranslations("navigation.quickSearch");
  const locale = useLocale();
  const menuLang = toMenuLang(locale);
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [catalog, setCatalog] = useState<QuickSearchItem[]>(() =>
    buildQuickSearchCatalog(null),
  );
  const [shortcutLabel, setShortcutLabel] = useState(t("shortcutWin"));

  const results = useMemo(
    () => filterQuickSearchItems(catalog, query),
    [catalog, query],
  );

  const showPanel = open;

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(
      navigator.platform || navigator.userAgent,
    );
    setShortcutLabel(isMac ? t("shortcutMac") : t("shortcutWin"));
  }, [t]);

  useEffect(() => {
    const cached = getStoredMenuForUser(user.userId, user.orgId, menuLang);
    if (cached && cached.length > 0) {
      setCatalog(buildQuickSearchCatalog(cached));
    }

    let cancelled = false;
    void fetchMenuClient({
      userId: user.userId,
      orgId: user.orgId,
      roleId: user.roleId,
      lang: menuLang,
    }).then((result) => {
      if (cancelled || !result.ok) return;
      setCatalog(buildQuickSearchCatalog(result.items));
    });

    return () => {
      cancelled = true;
    };
  }, [user.userId, user.orgId, user.roleId, menuLang]);

  const clearAndClose = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setOpen(false);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey;
      if (!isShortcut) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!showPanel) return;
    const root = listScrollRef.current;
    if (!root) return;
    const option = root.querySelector<HTMLElement>("[data-quick-active='true']");
    if (!option) return;
    const rootRect = root.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    if (optionRect.top < rootRect.top) {
      root.scrollTop -= rootRect.top - optionRect.top;
    } else if (optionRect.bottom > rootRect.bottom) {
      root.scrollTop += optionRect.bottom - rootRect.bottom;
    }
  }, [activeIndex, showPanel, results]);

  function navigateTo(item: QuickSearchItem) {
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
    inputRef.current?.blur();
    if (item.href === pathname) return;
    router.push(item.href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) {
        setQuery("");
        setActiveIndex(0);
        return;
      }
      clearAndClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((index) =>
        results.length === 0 ? 0 : Math.min(index + 1, results.length - 1),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (!open) setOpen(true);
      const selected = results[activeIndex];
      if (selected) navigateTo(selected);
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 w-full ${className}`.trim()}>
      <label className="relative block w-full">
        <span className="sr-only">{t("title")}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-soft" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder={t("placeholder")}
          className={`w-full rounded-2xl border border-border bg-surface-muted py-2.5 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-muted-soft focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden ${
            showShortcut ? "pr-20 lg:pr-24" : "pr-10"
          }`}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && results[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
              inputRef.current?.focus();
            }}
            className={`absolute top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200/80 hover:text-slate-700 ${
              showShortcut ? "right-12 lg:right-16" : "right-2.5"
            }`}
            aria-label={t("close")}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        ) : null}
        {showShortcut ? (
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-soft lg:inline">
            {shortcutLabel}
          </kbd>
        ) : null}
      </label>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t("results")}
          className="absolute top-[calc(100%+0.4rem)] left-0 z-50 w-full min-w-[min(100%,20rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28)] sm:min-w-[22rem] md:w-[min(28rem,calc(100vw-2rem))]"
        >
          <div
            ref={listScrollRef}
            className="max-h-[min(55vh,20rem)] overflow-y-auto overscroll-contain px-1.5 py-1.5 scrollbar-thin"
          >
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                {query.trim() ? t("noResults") : t("empty")}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {results.map((item, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={item.id}>
                      <button
                        id={`${listId}-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-quick-active={active ? "true" : undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => {
                          // Prevent input blur before click navigates.
                          event.preventDefault();
                        }}
                        onClick={() => navigateTo(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          active ? "bg-brand-soft" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-semibold ${
                              active ? "text-brand-ink" : "text-slate-900"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] leading-4 text-slate-500">
                            <span className="truncate">{item.group}</span>
                            <span className="shrink-0 text-slate-300">·</span>
                            <span className="truncate font-mono text-slate-400">
                              {item.href}
                            </span>
                          </span>
                        </span>
                        {active ? (
                          <CornerDownLeft
                            className="h-3.5 w-3.5 shrink-0 text-brand-ink/70"
                            strokeWidth={2}
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50/90 px-3 py-2 text-center text-[11px] text-slate-500">
            {t("hintFooter")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
