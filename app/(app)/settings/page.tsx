"use client";

import { useState } from "react";
import {
  Edit,
  Diamond,
  Download,
  Trash2,
  HelpCircle,
  FileText,
  ScrollText,
  LogOut,
  Bell,
  Lightbulb,
  Megaphone,
  ChevronRight,
} from "lucide-react";

const themes = [
  { id: "default", name: "Default", desc: "Soft navy", gradient: "from-[#3525cd] to-[#6366f1]" },
  { id: "feminine", name: "Feminine", desc: "Dusty rose", gradient: "from-[#be185d] to-[#f472b6]" },
  { id: "dark", name: "Dark", desc: "Sleek", gradient: "from-[#1e293b] to-[#3b82f6]" },
  { id: "nature", name: "Nature", desc: "Sage green", gradient: "from-[#059669] to-[#84cc16]" },
];

export default function SettingsPage() {
  const [activeTheme, setActiveTheme] = useState("default");
  const [notifications, setNotifications] = useState({
    daily: true,
    insight: true,
    promo: false,
  });

  return (
    <div className="pb-36">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-muted">Kelola profil dan preferensimu</p>
      </header>

      {/* Profile Card */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900">Wisnu Prasetyo</h2>
              <p className="text-xs text-muted">wisnu@email.com</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-md">Kombinasi</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">Sedang</span>
              </div>
            </div>
            <button className="btn-press p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Status */}
      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-primary-light/60 to-indigo-50/30 border border-primary/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Diamond className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">Premium Aktif</span>
              </div>
              <p className="text-sm font-bold text-slate-800">Plan Bulanan</p>
              <p className="text-xs text-muted mt-0.5">Berakhir 3 Agustus 2026</p>
            </div>
            <button className="btn-press px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Kelola
            </button>
          </div>
        </div>
      </section>

      {/* Theme Selector */}
      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Tema UI</h3>
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-muted mb-3">Pilih tampilan yang paling nyaman untukmu</p>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <label
                key={theme.id}
                className={`btn-press relative p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  activeTheme === theme.id
                    ? "border-primary bg-primary-light/20"
                    : "border-border-subtle hover:border-primary/30"
                }`}
                onClick={() => setActiveTheme(theme.id)}
              >
                <input type="radio" name="theme" className="hidden" checked={activeTheme === theme.id} readOnly />
                <div className={`w-full h-8 bg-gradient-to-r ${theme.gradient} rounded-lg mb-2`} />
                <span className="text-xs font-bold text-slate-800 block">{theme.name}</span>
                <span className="text-[10px] text-muted">{theme.desc}</span>
                {activeTheme === theme.id && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Notifikasi</h3>
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm space-y-4">
          <ToggleItem
            icon={Bell}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
            title="Reminder Harian"
            subtitle="Isi tracker setiap hari"
            checked={notifications.daily}
            onChange={() => setNotifications((p) => ({ ...p, daily: !p.daily }))}
          />
          <div className="h-px bg-border-subtle" />
          <ToggleItem
            icon={Lightbulb}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            title="Insight Baru"
            subtitle="Notifikasi saat ada insight"
            checked={notifications.insight}
            onChange={() => setNotifications((p) => ({ ...p, insight: !p.insight }))}
          />
          <div className="h-px bg-border-subtle" />
          <ToggleItem
            icon={Megaphone}
            iconBg="bg-rose-50"
            iconColor="text-rose-500"
            title="Promo & Update"
            subtitle="Info produk dan fitur baru"
            checked={notifications.promo}
            onChange={() => setNotifications((p) => ({ ...p, promo: !p.promo }))}
          />
        </div>
      </section>

      {/* Privacy & Data */}
      <section className="px-6 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1">Privasi & Data</h3>
        <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
          <SettingsButton icon={Download} title="Export Data" subtitle="Download semua data kamu" />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsButton icon={Trash2} title="Hapus Akun" subtitle="Hapus semua data permanen" isDanger />
        </div>
      </section>

      {/* About */}
      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
          <SettingsButton icon={HelpCircle} title="Pusat Bantuan" />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsButton icon={FileText} title="Kebijakan Privasi" />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsButton icon={ScrollText} title="Syarat & Ketentuan" />
        </div>
      </section>

      {/* Logout */}
      <section className="px-6 pb-8">
        <button className="btn-press w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
        <p className="text-center text-[10px] text-muted mt-4">Narehat v0.1 • © 2026</p>
      </section>
    </div>
  );
}

function ToggleItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-700 block">{title}</span>
          <span className="text-[10px] text-muted">{subtitle}</span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </label>
    </div>
  );
}

function SettingsButton({
  icon: Icon,
  title,
  subtitle,
  isDanger,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  isDanger?: boolean;
}) {
  return (
    <button className="btn-press w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDanger ? "bg-red-50" : "bg-slate-50"}`}>
        <Icon className={`w-4 h-4 ${isDanger ? "text-red-500" : "text-slate-500"}`} />
      </div>
      <div className="flex-1">
        <span className={`text-sm font-semibold block ${isDanger ? "text-red-600" : "text-slate-700"}`}>{title}</span>
        {subtitle && <span className="text-[10px] text-muted">{subtitle}</span>}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-light" />
    </button>
  );
}
