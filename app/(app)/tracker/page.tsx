"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface Day {
  day: string;
  date: string;
  dateStr: string;
  past: boolean;
}

function getWeekDays(): Day[] {
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date();
  const result: Day[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const monthDay = d.getDate().toString();
    result.push({
      day: dayNames[d.getDay()],
      date: monthDay,
      dateStr,
      past: i > 0,
    });
  }
  return result;
}

const days = getWeekDays();
const todayStr = days[6].dateStr;

const stressLabels = ["", "Santai", "Santai", "Sedang", "Tinggi", "Ekstrem"];
const stressEmojis = ["", "😌", "😌", "😤", "😫", "🤯"];
const stressColors = ["", "bg-emerald-50 text-emerald-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600", "bg-orange-50 text-orange-600", "bg-red-50 text-red-600"];

export default function TrackerPage() {
  const { showToast } = useToast();
  const [activeDate, setActiveDate] = useState(6);
  const [sleep, setSleep] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [water, setWater] = useState(0);
  const [stress, setStress] = useState(1);
  const [skincareMorning, setSkincareMorning] = useState(false);
  const [skincareEvening, setSkincareEvening] = useState(false);
  const [touchedFace, setTouchedFace] = useState(false);
  const [junkFood, setJunkFood] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const [formTouched, setFormTouched] = useState(false);
  const [weekLogs, setWeekLogs] = useState<Set<string>>(new Set());
  const [weekStats, setWeekStats] = useState<{ morning: number; evening: number; sleep: number; water: number } | null>(null);

  const selectedDateStr = days[activeDate].dateStr;

  useEffect(() => {
    const date = selectedDateStr;
    fetch(`/api/tracker?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (date !== selectedDateStr) return;
        const log = data.logs?.[0];
        if (log) {
          setSleep(log.sleep_hours ?? 0);
          setExercise(log.exercise_minutes ?? 0);
          setWater((log.water_ml ?? 0) / 1000);
          setStress(log.stress_level ?? 1);
          setSkincareMorning(log.skincare_morning ?? false);
          setSkincareEvening(log.skincare_evening ?? false);
          setTouchedFace(log.touched_face ?? false);
          setJunkFood(log.junk_food ?? false);
          setNotes(log.notes ?? "");
        } else {
          handleReset();
        }
        setFormTouched(false);
      })
      .catch(() => {});
  }, [selectedDateStr]);

  useEffect(() => {
    const dates = days.map((d) => d.dateStr).join(",");
    fetch(`/api/tracker?dates=${dates}`)
      .then((r) => r.json())
      .then((data) => {
        const logs = data.logs || [];
        const set = new Set<string>();
        let morning = 0, evening = 0, sleepSum = 0, waterSum = 0, n = 0;
        for (const log of logs) {
          set.add(log.date);
          if (log.skincare_morning) morning++;
          if (log.skincare_evening) evening++;
          sleepSum += log.sleep_hours || 0;
          waterSum += (log.water_ml || 0) / 1000;
          n++;
        }
        setWeekLogs(set);
        setWeekStats({ morning, evening, sleep: n ? sleepSum / n : 0, water: n ? waterSum / n : 0 });
      })
      .catch(() => {});
  }, []);

  const markTouched = () => {
    if (!formTouched) setFormTouched(true);
  };

  const adjSleep = (delta: number) => { setSleep((s) => Math.min(12, Math.max(0, Math.round((s + delta) * 10) / 10))); markTouched(); };
  const adjExercise = (delta: number) => { setExercise((e) => Math.min(120, Math.max(0, e + delta))); markTouched(); };
  const adjWater = (delta: number) => { setWater((w) => Math.min(2.5, Math.max(0, Math.round((w + delta) * 100) / 100))); markTouched(); };

  const waterCups = Math.floor(water / 0.5);
  const sleepPct = Math.round((sleep / 8) * 100);
  const exercisePct = Math.round((exercise / 30) * 100);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: days[activeDate].dateStr,
          sleep_hours: sleep,
          water_ml: Math.round(water * 1000),
          exercise_minutes: exercise,
          stress_level: stress,
          skincare_morning: skincareMorning,
          skincare_evening: skincareEvening,
          touched_face: touchedFace,
          junk_food: junkFood,
          notes,
        }),
      });
      if (res.ok) {
        showToast("Data berhasil disimpan!");
        setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        setFormTouched(false);
        const set = new Set(weekLogs);
        set.add(days[activeDate].dateStr);
        setWeekLogs(set);
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan data", "error");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Gagal terhubung ke server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSleep(0);
    setExercise(0);
    setWater(0);
    setStress(1);
    setSkincareMorning(false);
    setSkincareEvening(false);
    setTouchedFace(false);
    setJunkFood(false);
    setNotes("");
    setFormTouched(true);
  };

  const handleSelectDate = (i: number) => {
    if (i !== activeDate && formTouched) {
      const ok = window.confirm("Kamu punya perubahan yang belum disimpan. Lanjut pindah tanggal?");
      if (!ok) return;
    }
    setActiveDate(i);
    setFormTouched(false);
  };

  return (
    <main className="max-w-md md:max-w-4xl mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tracker Harian</h1>
          <p className="text-sm text-muted">Catat kebiasaanmu hari ini</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-border-light">
          <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
          <span className="text-sm font-semibold text-slate-700">
            {days[activeDate].day}, {days[activeDate].date}
          </span>
        </div>
      </header>

      {weekStats && (
        <section className="px-6 mb-4">
          <div className="bg-white border border-border-subtle rounded-3xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">insights</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Ringkasan 7 Hari</p>
                <p className="text-xs text-muted">
                  Skincare pagi {weekStats.morning}/7 · malam {weekStats.evening}/7
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="text-slate-600"><span className="font-bold">{Math.round(weekStats.sleep * 10) / 10}</span> jam tidur</p>
              <p className="text-muted"><span className="font-bold">{Math.round(weekStats.water * 100) / 100}</span> L air</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {days.map((d, i) => (
            <button
              key={d.date}
              onClick={() => handleSelectDate(i)}
              className={`btn-press min-w-[60px] py-2 px-3 rounded-xl text-center transition-all relative ${
                i === activeDate
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : d.past
                    ? "bg-white border border-border-subtle opacity-50"
                    : "bg-white border border-border-subtle"
              }`}
            >
              <span className={`text-[10px] block ${i === activeDate ? "text-white/70" : "text-muted"}`}>{d.day}</span>
              <span className={`text-sm font-bold ${i === activeDate ? "" : "text-slate-700"}`}>{d.date}</span>
              <span
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                  weekLogs.has(d.dateStr)
                    ? i === activeDate ? "bg-white" : "bg-emerald-500"
                    : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Sleep */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500">bedtime</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Kualitas Tidur</h3>
              <p className="text-xs text-muted">Berapa jam kamu tidur semalam?</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => adjSleep(-0.5)} className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
              <span className="material-symbols-outlined text-slate-600">remove</span>
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-extrabold text-slate-900">{sleep}</span>
              <span className="text-sm text-muted ml-1">jam</span>
            </div>
            <button onClick={() => adjSleep(0.5)} className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
              <span className="material-symbols-outlined text-slate-600">add</span>
            </button>
          </div>
          <input type="range" min={0} max={12} step={0.5} value={sleep} onChange={(e) => { setSleep(parseFloat(e.target.value)); markTouched(); }} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-light mt-1">
            <span>0 jam</span>
            <span className="font-semibold text-primary">Target: 8 jam</span>
            <span>12 jam</span>
          </div>
        </div>
      </section>

      {/* Water */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">water_drop</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Minum Air</h3>
              <p className="text-xs text-muted">Seberapa banyak air yang kamu minum?</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button onClick={() => adjWater(-0.25)} className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100">
              <span className="material-symbols-outlined text-blue-500">remove</span>
            </button>
            <div className="text-center min-w-[100px]">
              <span className="text-3xl font-extrabold text-slate-900">{water}</span>
              <span className="text-sm text-muted ml-1">L</span>
            </div>
            <button onClick={() => adjWater(0.25)} className="btn-press w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 hover:bg-blue-100">
              <span className="material-symbols-outlined text-blue-500">add</span>
            </button>
          </div>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-8 h-10 rounded-b-lg rounded-t-sm relative overflow-hidden ${i < waterCups ? "bg-blue-400" : "bg-slate-100 border-2 border-dashed border-slate-200"}`}>
                {i < waterCups && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500" style={{ height: `${Math.min(100, ((water - i * 0.5) / 0.5) * 100)}%` }} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-2">Target: 2.5L (5 gelas)</p>
        </div>
      </section>

      {/* Stress */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Tingkat Stress</h3>
              <p className="text-xs text-muted">Seberapa stress kamu hari ini?</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-2xl">😌</span><span className="text-2xl">😐</span><span className="text-2xl">😤</span><span className="text-2xl">😫</span><span className="text-2xl">🤯</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={stress} onChange={(e) => { setStress(parseInt(e.target.value)); markTouched(); }} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-light mt-1 px-1">
            <span>Santai</span><span>Sedang</span><span>Ekstrem</span>
          </div>
          <div className="mt-3 text-center">
            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${stressColors[stress]}`}>
              {stressLabels[stress]} ({stress}/5) {stressEmojis[stress]}
            </span>
          </div>
        </div>
      </section>

      {/* Detail toggle */}
      <section className="px-6 mb-6">
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="btn-press w-full py-3 bg-white border border-border-light rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary hover:border-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{showDetail ? "expand_less" : "expand_more"}</span>
          {showDetail ? "Sembunyikan Detail" : "Lihat Detail Lainnya"}
          <span className="text-[10px] text-muted-light">(Olahraga, Skincare, Pemicu, Catatan)</span>
        </button>
      </section>

      {showDetail && (
      <>

      {/* Exercise */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">directions_run</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Olahraga</h3>
              <p className="text-xs text-muted">Berapa menit kamu berolahraga?</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => adjExercise(-5)} className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
              <span className="material-symbols-outlined text-slate-600">remove</span>
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-extrabold text-slate-900">{exercise}</span>
              <span className="text-sm text-muted ml-1">menit</span>
            </div>
            <button onClick={() => adjExercise(5)} className="btn-press w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-border-light hover:bg-slate-100">
              <span className="material-symbols-outlined text-slate-600">add</span>
            </button>
          </div>
          <input type="range" min={0} max={120} step={5} value={exercise} onChange={(e) => { setExercise(parseInt(e.target.value)); markTouched(); }} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-light mt-1">
            <span>0 mnt</span>
            <span className={`font-semibold ${exercise >= 30 ? "text-emerald-600" : "text-primary"}`}>
              {exercise >= 30 ? "Target: 30 mnt ✅" : `Kurang ${30 - exercise} mnt`}
            </span>
            <span>120 mnt</span>
          </div>
        </div>
      </section>

      {/* Skincare */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-500">spa</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Rutinitas Skincare</h3>
              <p className="text-xs text-muted">Centang yang sudah kamu lakukan</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={skincareMorning} onChange={(e) => { setSkincareMorning(e.target.checked); markTouched(); }} className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 block">Pagi</span>
                <span className="text-xs text-muted">Cleanser → Toner → Moisturizer → Sunscreen</span>
              </div>
              {skincareMorning && <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>}
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={skincareEvening} onChange={(e) => { setSkincareEvening(e.target.checked); markTouched(); }} className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 block">Malam</span>
                <span className="text-xs text-muted">Double cleanse → Toner → Serum → Moisturizer</span>
              </div>
              {skincareEvening && <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>}
            </label>
          </div>
        </div>
      </section>

      {/* Pemicu */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-500">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Faktor Pemicu</h3>
              <p className="text-xs text-muted">Hal yang bisa memperburuk jerawat</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={touchedFace} onChange={(e) => { setTouchedFace(e.target.checked); markTouched(); }} className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary" />
              <span className="flex-1 text-sm font-semibold text-slate-700">Menyentuh wajah</span>
              {touchedFace && <span className="material-symbols-outlined text-rose-500 text-lg">check_circle</span>}
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={junkFood} onChange={(e) => { setJunkFood(e.target.checked); markTouched(); }} className="w-5 h-5 rounded-lg border-border-light text-primary focus:ring-primary" />
              <span className="flex-1 text-sm font-semibold text-slate-700">Makan junk food / tidak sehat</span>
              {junkFood && <span className="material-symbols-outlined text-rose-500 text-lg">check_circle</span>}
            </label>
          </div>
        </div>
      </section>

      </>
      )}

      {showDetail && (
      <>
      {/* Notes */}
      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500">edit_note</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Catatan</h3>
              <p className="text-xs text-muted">Ada yang mau dicatat?</p>
            </div>
          </div>
          <textarea
            placeholder="Contoh: Hari ini makan pedas, jerawat baru di pipi kiri..."
            value={notes}
            onChange={(e) => { setNotes(e.target.value); markTouched(); }}
            className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
          />
        </div>
      </section>
      </>
      )}

      {/* Actions */}
      <div className="px-6 pb-8 space-y-3">
        {formTouched ? (
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Ada perubahan yang belum disimpan
          </div>
        ) : savedAt ? (
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Tersimpan • {savedAt}
          </div>
        ) : null}
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">save</span>
          {loading ? "Menyimpan..." : "Simpan Catatan Hari Ini"}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="btn-press w-full py-3 bg-white border border-border-light text-sm font-semibold text-slate-500 rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </main>
  );
}
