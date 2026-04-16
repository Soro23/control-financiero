/**
 * Recurring entry utilities.
 *
 * Terminology:
 *  - "series"  : a logical recurring entry identified by (concept + category_id + frequency + amount).
 *  - "origin"  : the earliest known date for that series.
 *  - "backfill": generating Firestore documents for every expected date between
 *                the origin and today that does not yet have an entry.
 *
 * These functions are pure (no side effects) and are tested independently.
 * Firestore operations live in lib/firebase/recurring.ts.
 */

export type RecurrenceFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "yearly";

/**
 * Returns the next occurrence date for a given frequency.
 * Uses noon UTC to avoid DST/timezone shifts on month boundaries.
 */
export function advanceDate(dateStr: string, frequency: RecurrenceFrequency): string {
  const date = new Date(dateStr + "T12:00:00Z");
  switch (frequency) {
    case "weekly":    date.setUTCDate(date.getUTCDate() + 7);          break;
    case "biweekly":  date.setUTCDate(date.getUTCDate() + 14);         break;
    case "monthly":   date.setUTCMonth(date.getUTCMonth() + 1);        break;
    case "bimonthly": date.setUTCMonth(date.getUTCMonth() + 2);        break;
    case "quarterly": date.setUTCMonth(date.getUTCMonth() + 3);        break;
    case "yearly":    date.setUTCFullYear(date.getUTCFullYear() + 1);  break;
  }
  return date.toISOString().split("T")[0];
}

/**
 * Returns every date at which a recurring entry should appear,
 * starting from originDate and going up to (and including) min(maxDate, endDate).
 * If endDate is provided and is earlier than maxDate, stops at endDate.
 */
export function getExpectedDates(
  originDate: string,
  frequency: RecurrenceFrequency,
  maxDate: string,
  endDate?: string | null
): string[] {
  const dates: string[] = [];
  let current = originDate;
  const effectiveEnd = endDate && endDate < maxDate ? endDate : maxDate;
  while (current <= effectiveEnd) {
    dates.push(current);
    current = advanceDate(current, frequency);
  }
  return dates;
}
