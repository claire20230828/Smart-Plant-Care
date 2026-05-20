/** Parse YYYY-MM-DD (or ISO prefix) as local calendar date. */
export function parseDateOnly(iso: string): Date {
  const dayPart = iso.split("T")[0] ?? iso;
  const [y, m, d] = dayPart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calendar days from today until the next watering due date.
 * Last watered + frequency = due date; compare to today.
 * Negative = overdue by that many days.
 */
export function daysUntilWateringDue(
  lastWateredIso: string,
  wateringFrequencyDays: number,
): number {
  const last = startOfLocalDay(parseDateOnly(lastWateredIso));
  const due = new Date(last);
  due.setDate(due.getDate() + wateringFrequencyDays);
  const today = startOfLocalDay(new Date());
  return Math.round(
    (startOfLocalDay(due).getTime() - today.getTime()) / 86_400_000,
  );
}

/** Upcoming list: overdue, due today, or due tomorrow only. */
export function isInUpcomingWateringWindow(daysUntil: number): boolean {
  return daysUntil <= 1;
}

export type WateringBadgeKind = "overdue" | "today" | "tomorrow";

export function wateringBadgeLabel(daysUntil: number): {
  kind: WateringBadgeKind;
  label: string;
} | null {
  if (!isInUpcomingWateringWindow(daysUntil)) return null;
  if (daysUntil < 0) {
    return { kind: "overdue", label: `${Math.abs(daysUntil)}d overdue` };
  }
  if (daysUntil === 0) {
    return { kind: "today", label: "Water today" };
  }
  return { kind: "tomorrow", label: "in 1d" };
}
