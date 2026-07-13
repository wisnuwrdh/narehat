import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportData {
  exportedAt: string;
  profile: Record<string, unknown> | null;
  dailyLogs: Record<string, unknown>[];
  skinPhotos: Record<string, unknown>[];
  skincareProducts: Record<string, unknown>[];
  insights: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  aiUsage: Record<string, unknown>[];
}

const skinLabels: Record<string, string> = {
  oily: "Berminyak", dry: "Kering", combination: "Kombinasi", normal: "Normal", sensitive: "Sensitif",
};
const severityLabels: Record<string, string> = { mild: "Ringan", moderate: "Sedang", severe: "Parah" };
const goalLabels: Record<string, string> = {
  clear_acne: "Jerawat Hilang", fade_scars: "Bekas Memudar", brighter_skin: "Kulit Cerah", all: "Semua",
};
const planLabels: Record<string, string> = {
  free: "Gratis", premium_monthly: "Premium Bulanan", premium_yearly: "Premium Tahunan",
  pro_monthly: "Pro Bulanan", pro_yearly: "Pro Tahunan",
};
const typeLabels: Record<string, string> = {
  correlation: "Korelasi", trend: "Tren", recommendation: "Rekomendasi",
  reminder: "Pengingat", insight: "Insight", promo: "Promo",
};
const analysisLabels: Record<string, string> = { detect: "Deteksi", purging: "Purging" };
const featureLabels: Record<string, string> = {
  consult: "AI Consult", detect: "Deteksi Jerawat", purging: "Purging Check",
  routine_analyze: "Analisis Rutinitas", routine_build: "Bangun Rutinitas",
};

const profileColumnMap: Record<string, string> = {
  name: "Nama", email: "Email", skin_type: "Tipe Kulit", acne_severity: "Tingkat Jerawat",
  goal: "Tujuan", plan: "Plan", created_at: "Terdaftar", updated_at: "Diupdate",
};

const dailyLogColumnMap: Record<string, string> = {
  date: "Tanggal", sleep_hours: "Jam Tidur", water_ml: "Air (ml)",
  exercise_minutes: "Olahraga (menit)", stress_level: "Level Stress",
  skincare_morning: "Skincare Pagi", skincare_evening: "Skincare Malam",
  touched_face: "Menyentuh Wajah", junk_food: "Makanan Cepat Saji",
  notes: "Catatan", created_at: "Dibuat",
};

const photoColumnMap: Record<string, string> = {
  date: "Tanggal", notes: "Catatan", analysis_type: "Tipe Analisis", created_at: "Dibuat",
};

const productColumnMap: Record<string, string> = {
  name: "Nama", brand: "Merek", category: "Kategori", active: "Aktif",
  notes: "Catatan", created_at: "Dibuat",
};

const insightColumnMap: Record<string, string> = {
  date: "Tanggal", type: "Tipe", title: "Judul", description: "Deskripsi", created_at: "Dibuat",
};

const notifColumnMap: Record<string, string> = {
  type: "Tipe", title: "Judul", description: "Deskripsi",
  related_link: "Link Terkait", is_read: "Sudah Dibaca", created_at: "Dibuat",
};

const usageColumnMap: Record<string, string> = {
  feature: "Fitur", created_at: "Waktu",
};

function formatValue(v: unknown, key: string): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (key === "skin_type") return skinLabels[String(v)] || String(v);
  if (key === "acne_severity") return severityLabels[String(v)] || String(v);
  if (key === "goal") return goalLabels[String(v)] || String(v);
  if (key === "plan") return planLabels[String(v)] || String(v);
  if (key === "type") return typeLabels[String(v)] || String(v);
  if (key === "analysis_type") return analysisLabels[String(v)] || String(v);
  if (key === "feature") return featureLabels[String(v)] || String(v);
  if ((key === "date" || key === "created_at" || key === "updated_at") && typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return String(v);
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function transformRows(rows: Record<string, unknown>[], columnMap: Record<string, string>): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [key, label] of Object.entries(columnMap)) {
      if (!(key in row)) continue;
      out[label] = formatValue(row[key], key);
    }
    return out;
  });
}

function rowsToCSV(rows: Record<string, unknown>[], columnMap: Record<string, string>): string {
  if (rows.length === 0) return "";
  const transformed = transformRows(rows, columnMap);
  const keys = Object.keys(transformed[0]);
  const header = keys.map((k) => `"${k}"`).join(",");
  const body = transformed
    .map((row) => keys.map((k) => `"${String(row[k] || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function downloadBlob(content: string | ArrayBuffer, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsCSV(data: ExportData) {
  const parts: string[] = [];
  const timestamp = new Date().toISOString().split("T")[0];

  if (data.profile) {
    parts.push(`# Profil\n${rowsToCSV([data.profile], profileColumnMap)}`);
  }

  const tables: [string, Record<string, unknown>[], Record<string, string>][] = [
    ["Log Harian", data.dailyLogs, dailyLogColumnMap],
    ["Foto Kulit", data.skinPhotos, photoColumnMap],
    ["Produk Skincare", data.skincareProducts, productColumnMap],
    ["Insight", data.insights, insightColumnMap],
    ["Notifikasi", data.notifications, notifColumnMap],
    ["Penggunaan AI", data.aiUsage, usageColumnMap],
  ];

  for (const [title, rows, colMap] of tables) {
    parts.push(`# ${title}\n${rowsToCSV(rows, colMap)}`);
  }

  downloadBlob("\uFEFF" + parts.join("\n\n"), `narehat-data-${timestamp}.csv`, "text/csv;charset=utf-8");
}

function addTableToPDF(
  doc: jsPDF,
  rows: Record<string, unknown>[],
  columnMap: Record<string, string>,
  startY: number,
): number {
  if (rows.length === 0) return startY;
  const transformed = transformRows(rows, columnMap);
  const keys = Object.keys(transformed[0]);
  autoTable(doc, {
    startY,
    head: [keys],
    body: transformed.map((r) => keys.map((k) => r[k] || "-")),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
}

export function exportAsPDF(data: ExportData) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  let y = 20;

  doc.setFontSize(16);
  doc.text("Export Data Narehat", 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Diekspor pada: ${timestamp}`, 14, y);
  y += 12;

  if (data.profile) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Profil", 14, y);
    y += 7;
    const body = Object.entries(profileColumnMap).map(([key, label]) => {
      return [label, formatValue(data.profile![key], key)];
    });
    autoTable(doc, {
      startY: y,
      head: [["Field", "Nilai"]],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [145, 103, 255] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  const tables: [string, Record<string, unknown>[], Record<string, string>][] = [
    ["Log Harian", data.dailyLogs, dailyLogColumnMap],
    ["Foto Kulit", data.skinPhotos, photoColumnMap],
    ["Produk Skincare", data.skincareProducts, productColumnMap],
    ["Insight", data.insights, insightColumnMap],
    ["Notifikasi", data.notifications, notifColumnMap],
    ["Penggunaan AI", data.aiUsage, usageColumnMap],
  ];

  for (const [title, rows, colMap] of tables) {
    if (rows.length === 0) continue;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${title} (${rows.length})`, 14, y);
    y += 7;
    y = addTableToPDF(doc, rows, colMap, y);
  }

  doc.save(`narehat-data-${new Date().toISOString().split("T")[0]}.pdf`);
}
