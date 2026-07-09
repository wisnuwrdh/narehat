"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NotificationItem {
  id: string;
  type: "reminder" | "insight" | "promo";
  title: string;
  description: string;
  related_link: string;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  reminder: { icon: "notifications", color: "text-indigo-500", bg: "bg-indigo-50" },
  insight: { icon: "lightbulb", color: "text-amber-500", bg: "bg-amber-50" },
  promo: { icon: "campaign", color: "text-rose-500", bg: "bg-rose-50" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;

  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function groupByDate(notifications: NotificationItem[]): Record<string, NotificationItem[]> {
  const groups: Record<string, NotificationItem[]> = {};
  for (const n of notifications) {
    const label = formatDate(n.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/notifications?limit=50").then((r) => r.json()),
      fetch("/api/notifications", { method: "POST" }).then((r) => r.json()).catch(() => {}),
    ]).then(([data]) => {
      setNotifications(data.notifications || []);
      setLoading(false);
    });
  }, []);

  const markAsRead = async (ids: string[]) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) markAsRead(unreadIds);
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  if (loading) {
    return (
      <main className="max-w-md mx-auto">
        <header className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
        </header>
        <div className="px-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-20" />
          ))}
        </div>
      </main>
    );
  }

  const grouped = groupByDate(notifications);

  return (
    <main className="max-w-md mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
          <p className="text-xs text-muted">
            {notifications.length > 0
              ? `${notifications.filter((n) => !n.is_read).length} belum dibaca`
              : "Belum ada notifikasi"}
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-primary px-3 py-2 rounded-xl hover:bg-primary-light transition-colors"
          >
            Tandai semua dibaca
          </button>
        )}
      </header>

      {notifications.length === 0 ? (
        <section className="px-6 py-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
          </div>
          <h2 className="text-base font-bold text-slate-700 mb-1">Belum ada notifikasi</h2>
          <p className="text-sm text-muted">
            Notifikasi akan muncul saat ada insight baru, reminder tracker, atau update dari Narehat.
          </p>
        </section>
      ) : (
        <section className="px-6 pb-8">
          {Object.entries(grouped).map(([groupLabel, items]) => (
            <div key={groupLabel} className="mb-4">
              <p className="text-xs font-bold text-muted-light mb-2 px-1">{groupLabel}</p>
              <div className="space-y-2">
                {items.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.reminder;
                  const content = (
                    <div
                      className={`flex gap-3 p-3 rounded-2xl transition-colors ${
                        n.is_read ? "bg-white border border-border-subtle" : "bg-indigo-50/30 border border-indigo-100"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <span className={`material-symbols-outlined text-lg ${cfg.color}`}>{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.is_read ? "font-medium text-slate-700" : "font-bold text-slate-900"} leading-tight`}>
                          {n.title}
                        </p>
                        {n.description && (
                          <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.description}</p>
                        )}
                      </div>
                      {!n.is_read && (
                        <div className="shrink-0 pt-1">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                        </div>
                      )}
                    </div>
                  );

                  if (n.related_link) {
                    return (
                      <Link
                        key={n.id}
                        href={n.related_link}
                        onClick={() => markAsRead([n.id])}
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead([n.id])}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
