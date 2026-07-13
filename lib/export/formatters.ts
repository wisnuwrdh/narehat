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

function rowsToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.map((k) => `"${k}"`).join(",");
  const body = rows
    .map((row) =>
      keys
        .map((k) => {
          const v = row[k];
          if (v === null || v === undefined) return "";
          const s = typeof v === "object" ? JSON.stringify(v) : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function exportAsJSON(data: ExportData) {
  downloadBlob(JSON.stringify(data, null, 2), "narehat-data.json", "application/json");
}

export function exportAsCSV(data: ExportData) {
  const parts: string[] = [];
  const timestamp = new Date().toISOString().split("T")[0];

  if (data.profile) {
    parts.push(`# Profil\n${rowsToCSV([data.profile])}`);
  }

  const tables: [string, Record<string, unknown>[]][] = [
    ["Daily Logs", data.dailyLogs],
    ["Skin Photos", data.skinPhotos],
    ["Skincare Products", data.skincareProducts],
    ["Insights", data.insights],
    ["Notifications", data.notifications],
    ["AI Usage", data.aiUsage],
  ];

  for (const [title, rows] of tables) {
    parts.push(`# ${title}\n${rowsToCSV(rows)}`);
  }

  downloadBlob("\uFEFF" + parts.join("\n\n"), `narehat-data-${timestamp}.csv`, "text/csv;charset=utf-8");
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
  doc.text(`Diexport pada: ${timestamp}`, 14, y);
  y += 12;

  if (data.profile) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Profil", 14, y);
    y += 7;
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Nama", String(data.profile.name || "-")],
        ["Email", String(data.profile.email || "-")],
        ["Tipe Kulit", skinLabels[String(data.profile.skin_type)] || String(data.profile.skin_type)],
        ["Tingkat Jerawat", severityLabels[String(data.profile.acne_severity)] || String(data.profile.acne_severity)],
        ["Goal", goalLabels[String(data.profile.goal)] || String(data.profile.goal)],
        ["Plan", String(data.profile.plan || "-")],
        ["Terdaftar", new Date(String(data.profile.created_at)).toLocaleDateString("id-ID")],
      ],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [145, 103, 255] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  const tables: [string, Record<string, unknown>[]][] = [
    ["Daily Logs", data.dailyLogs],
    ["Skin Photos", data.skinPhotos],
    ["Skincare Products", data.skincareProducts],
    ["Insights", data.insights],
    ["Notifications", data.notifications],
    ["AI Usage", data.aiUsage],
  ];

  for (const [title, rows] of tables) {
    if (rows.length === 0) continue;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${title} (${rows.length})`, 14, y);
    y += 7;

    const keys = Object.keys(rows[0]);
    autoTable(doc, {
      startY: y,
      head: [keys],
      body: rows.map((r) =>
        keys.map((k) => {
          const v = r[k];
          if (v === null || v === undefined) return "-";
          if (typeof v === "object") return JSON.stringify(v);
          if (typeof v === "boolean") return v ? "Ya" : "Tidak";
          return String(v);
        })
      ),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  doc.save(`narehat-data-${new Date().toISOString().split("T")[0]}.pdf`);
}
