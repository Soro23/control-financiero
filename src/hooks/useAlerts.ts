"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { Alert, AlertFormData } from "@/types";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "users", userId, "alerts"),
      orderBy("created_at", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertList: Alert[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          user_id: userId,
          type: data.type,
          title: data.title,
          message: data.message,
          is_read: data.is_read ?? false,
          created_at: data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        };
      });

      setAlerts(alertList);
      setUnreadCount(alertList.filter((a) => !a.is_read).length);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const createAlert = useCallback(async (data: AlertFormData): Promise<boolean> => {
    if (!userId) return false;
    try {
      await addDoc(collection(db, "users", userId, "alerts"), {
        ...data,
        is_read: false,
        created_at: serverTimestamp(),
      });
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  const markAsRead = useCallback(async (alertId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      await updateDoc(doc(db, "users", userId, "alerts", alertId), {
        is_read: true,
      });
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    try {
      const unread = alerts.filter((a) => !a.is_read);
      await Promise.all(unread.map((a) =>
        updateDoc(doc(db, "users", userId, "alerts", a.id), { is_read: true })
      ));
      return true;
    } catch {
      return false;
    }
  }, [userId, alerts]);

  return { alerts, unreadCount, loading, createAlert, markAsRead, markAllAsRead };
}