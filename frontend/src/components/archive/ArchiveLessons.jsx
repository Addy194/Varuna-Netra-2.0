import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, ShieldCheck, Waves } from "lucide-react";
import { api } from "@/lib/api";

const Stat = ({ label, value }) => (
  <div className="rounded border bg-slate-950/30 px-3 py-2" style={{ borderColor: "var(--border-default)" }}>
    <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-0.5 font-display text-lg font-bold text-slate-100">{value}</div>
  </div>
);

const ItemList = ({ items, empty = "No data available" }) => (
  <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
    {items.length ? items.map((item, i) => (
      <li key={`${i}-${String(item).slice(0, 24)}`} className="flex gap-2">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
        <span>{item}</span>
      </li>
    )) : <li className="text-slate-500">{empty}</li>}
  </ul>
);

export function ArchiveLessons() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/archive/lessons")
      .then((r) => { if (active) setData(r.data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const topEcosystems = useMemo(() => (data?.problems?.ecosystems_affected || []).slice(0, 4), [data]);
  const topMethods = useMemo(() => (data?.solutions?.remediation_used || []).slice(0, 4), [data]);
  const lessons = useMemo(() => (data?.solutions?.lessons || []).slice(0, expanded ? 12 : 3), [data, expanded]);

  if (error) return null;
  if (!data) {
    return <div className="panel mb-4 h-24 animate-pulse" data-testid="archive-lessons-loading" />;
  }

  const total = Number(data.total_volume_tonnes || 0);
  const impacts = Array.isArray(data?.problems?.impacts) ? data.problems.impacts.slice(0, 4) : [];
  const tactics = Array.isArray(data?.solutions?.response_tactics) ? data.solutions.response_tactics.slice(0, 4) : [];

  return (
    <section className="panel mb-4 p-4" data-testid="archive-lessons">
      <div className="flex flex-wrap items-start gap-3">
        <div className="mr-auto">
          <div className="flex items-center gap-2">
            <Lightbulb size={15} color="#38BDF8" />
            <h2 className="font-display text-base font-semibold text-slate-100">What historical spills teach us</h2>
          </div>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-slate-400">
            Cross-incident synthesis from the curated archive. It highlights recurring impacts and response patterns; it is context for analysts, not proof that a past tactic will work in every incident.
          </p>
        </div>
        <div className="grid min-w-[260px] grid-cols-2 gap-2">
          <Stat label="incidents" value={data.incidents ?? "—"} />
          <Stat label="recorded volume" value={total ? `${Math.round(total).toLocaleString()} t` : "—"} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded border p-3" style={{ borderColor: "var(--border-default)" }}>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300"><AlertTriangle size={12} /> Recurring impacts</div>
          <ItemList items={impacts} />
        </div>

        <div className="rounded border p-3" style={{ borderColor: "var(--border-default)" }}>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300"><Waves size={12} /> Frequently affected</div>
          <ItemList items={topEcosystems.map((x) => `${x.ecosystem} · ${x.incidents} incident${x.incidents === 1 ? "" : "s"}`)} />
        </div>

        <div className="rounded border p-3" style={{ borderColor: "var(--border-default)" }}>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300"><ShieldCheck size={12} /> Response patterns</div>
          <ItemList items={tactics.length ? tactics : topMethods.map((x) => `${x.method} · ${x.incidents} incident${x.incidents === 1 ? "" : "s"}`)} />
        </div>
      </div>

      {lessons.length > 0 && (
        <div className="mt-3 rounded border p-3" style={{ borderColor: "var(--border-default)" }} data-testid="archive-lessons-examples">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Case lessons</div>
          <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((x) => (
              <div key={`${x.incident}-${x.date}`} className="rounded bg-slate-950/35 p-2.5">
                <div className="font-display text-xs font-semibold text-slate-200">{x.incident}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{x.lesson}</p>
              </div>
            ))}
          </div>
          {(data?.solutions?.lessons || []).length > 3 && (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300 hover:text-cyan-200" data-testid="archive-lessons-toggle">
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Show fewer lessons" : "Show more lessons"}
            </button>
          )}
        </div>
      )}

      {data.note && <p className="mt-3 font-mono text-[9px] leading-relaxed text-slate-500">{data.note}</p>}
    </section>
  );
}
