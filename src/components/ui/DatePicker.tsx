"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Inclusive min date `Y-m-d`. */
  min?: string;
  /** Inclusive max date `Y-m-d`. */
  max?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
};

const WEEKDAY_KEYS = [
  "weekdayMo",
  "weekdayTu",
  "weekdayWe",
  "weekdayTh",
  "weekdayFr",
  "weekdaySa",
  "weekdaySu",
] as const;

function parseYmd(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Monday-first grid (42 cells). */
function buildMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  return toYmd(a) < toYmd(b);
}

function isAfterDay(a: Date, b: Date): boolean {
  return toYmd(a) > toYmd(b);
}

/**
 * Project-styled date picker (popover calendar).
 * Value is always `Y-m-d` (or empty string).
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  className = "",
  id,
  ...aria
}: DatePickerProps) {
  const t = useTranslations("ui");
  const locale = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => parseYmd(value), [value]);
  const minDate = useMemo(() => (min ? parseYmd(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseYmd(max) : null), [max]);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ?? new Date()),
  );

  useEffect(() => {
    if (!open) return;
    setViewMonth(startOfMonth(selected ?? new Date()));
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayLabel = useMemo(() => {
    if (!selected) return null;
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(selected);
    } catch {
      return value;
    }
  }, [locale, selected, value]);

  const monthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(viewMonth);
    } catch {
      return `${viewMonth.getMonth() + 1}/${viewMonth.getFullYear()}`;
    }
  }, [locale, viewMonth]);

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  function isDisabledDay(day: Date): boolean {
    if (minDate && isBeforeDay(day, minDate)) return true;
    if (maxDate && isAfterDay(day, maxDate)) return true;
    return false;
  }

  function choose(day: Date) {
    if (isDisabledDay(day)) return;
    onChange(toYmd(day));
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  function chooseToday() {
    if (isDisabledDay(today)) return;
    onChange(toYmd(today));
    setViewMonth(startOfMonth(today));
    setOpen(false);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-left text-sm outline-none transition hover:border-slate-300 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-brand/40 bg-white ring-4 ring-brand/10" : ""
        }`}
      >
        <span
          className={`min-w-0 truncate ${
            displayLabel ? "font-medium text-slate-800" : "text-muted-soft"
          }`}
        >
          {displayLabel ?? placeholder ?? t("datePlaceholder")}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-muted-soft">
          <CalendarDays className="h-4 w-4" />
          <ChevronDown
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("calendarLabel")}
          className="absolute z-50 mt-1.5 w-[18.5rem] overflow-hidden rounded-xl border border-border bg-white p-3 shadow-[var(--shadow-card)]"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{monthLabel}</p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label={t("calendarPrevMonth")}
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-surface-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("calendarNextMonth")}
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-surface-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAY_KEYS.map((key) => (
              <span
                key={key}
                className="py-1 text-center text-[10px] font-semibold tracking-wide text-muted uppercase"
              >
                {t(key)}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, today);
              const dayDisabled = isDisabledDay(day);
              return (
                <button
                  key={toYmd(day)}
                  type="button"
                  disabled={dayDisabled}
                  aria-pressed={isSelected}
                  onClick={() => choose(day)}
                  className={`inline-flex h-9 items-center justify-center rounded-lg text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    isSelected
                      ? "bg-brand font-semibold text-white"
                      : isToday
                        ? "border border-brand/40 font-semibold text-brand-ink"
                        : inMonth
                          ? "text-slate-800 hover:bg-surface-muted"
                          : "text-muted-soft hover:bg-surface-muted"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={clear}
              className="text-xs font-semibold text-slate-600 transition hover:text-slate-900"
            >
              {t("dateClear")}
            </button>
            <button
              type="button"
              onClick={chooseToday}
              disabled={isDisabledDay(today)}
              className="text-xs font-semibold text-brand transition hover:text-brand-ink disabled:opacity-40"
            >
              {t("dateToday")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
