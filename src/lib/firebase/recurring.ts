/**
 * Backfill logic for recurring entries.
 *
 * On each page load (useIngresos / useGastos) we call backfillRecurringEntries.
 * It:
 *  1. Fetches every entry with is_recurring=true for the collection.
 *  2. Groups them into "series" by (concept | category_id | frequency | amount).
 *  3. For each series, finds the earliest date (origin) and the set of dates
 *     that already exist.
 *  4. Computes all expected dates from origin → today.
 *  5. Creates Firestore documents for any missing dates.
 *
 * The function is idempotent: calling it multiple times never creates duplicates.
 */

import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./client";
import { advanceDate, getExpectedDates, type RecurrenceFrequency } from "@/lib/utils/recurring";

interface RecurringSnapshot {
  concept: string;
  category_id: string;
  subcategory_id?: string | null;
  amount: number;
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency;
  notes: string | null;
  date: string;
}

type CollectionName = "income_entries" | "expense_entries";

/**
 * Backfills missing recurring entries up to (and including) today.
 * Returns true if any new entries were created.
 */
export async function backfillRecurringEntries(
  userId: string,
  collectionName: CollectionName
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const snap = await getDocs(
    query(
      collection(db, "users", userId, collectionName),
      where("is_recurring", "==", true)
    )
  );

  if (snap.empty) return false;

  // Build series map: seriesKey → { origin, existingDates, sample }
  type SeriesData = {
    origin: string;
    existingDates: Set<string>;
    sample: RecurringSnapshot;
  };
  const seriesMap = new Map<string, SeriesData>();

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as RecurringSnapshot;
    if (!data.recurrence_frequency) continue;

    const key = [
      data.concept,
      data.category_id,
      data.recurrence_frequency,
      Math.round(data.amount * 100), // avoid float precision issues
    ].join("|");

    const existing = seriesMap.get(key);
    if (!existing) {
      seriesMap.set(key, {
        origin: data.date,
        existingDates: new Set([data.date]),
        sample: data,
      });
    } else {
      existing.existingDates.add(data.date);
      if (data.date < existing.origin) {
        existing.origin = data.date;
        existing.sample = data; // keep earliest as canonical sample
      }
    }
  }

  // Collect missing entries across all series
  const toCreate: RecurringSnapshot[] = [];

  for (const series of seriesMap.values()) {
    const expected = getExpectedDates(
      series.origin,
      series.sample.recurrence_frequency,
      today
    );

    for (const date of expected) {
      if (!series.existingDates.has(date)) {
        toCreate.push({ ...series.sample, date });
      }
    }
  }

  if (toCreate.length === 0) return false;

  const batch = writeBatch(db);
  for (const entry of toCreate) {
    const ref = doc(collection(db, "users", userId, collectionName));
    batch.set(ref, {
      ...entry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  await batch.commit();

  return true;
}

/**
 * Generates recurring entries from the day AFTER startDate up to today.
 * Call this after creating the initial entry so the current occurrence
 * is not duplicated.
 *
 * Note: for very frequent recurrences (weekly/biweekly) this fills in all
 * past occurrences from startDate. Future occurrences are handled by
 * backfillRecurringEntries on the next page load.
 */
export async function createForwardRecurringEntries(
  baseData: Record<string, unknown>,
  startDate: string,
  frequency: RecurrenceFrequency,
  userId: string,
  collectionName: CollectionName
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const entries: Record<string, unknown>[] = [];

  // Start from the NEXT occurrence (startDate was already created)
  let current = advanceDate(startDate, frequency);

  while (current <= today) {
    entries.push({ ...baseData, date: current });
    current = advanceDate(current, frequency);
  }

  if (entries.length > 0) {
    const batch = writeBatch(db);
    for (const e of entries) {
      const ref = doc(collection(db, "users", userId, collectionName));
      batch.set(ref, e);
    }
    await batch.commit();
  }
}
