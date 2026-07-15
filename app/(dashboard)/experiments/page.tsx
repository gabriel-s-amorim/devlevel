"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface Experiment {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  targetMetric: string;
  complianceLog?: { date: string; completed: boolean; value?: number }[];
}

const inputClass =
  "w-full border border-border rounded-xl bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    targetMetric: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/experiments", { credentials: "include" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Falha ao carregar"))
      )
      .then((data) => setExperiments(data.experiments || []))
      .catch(() => setError("Erro ao carregar experimentos"))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        targetMetric: form.targetMetric,
      }),
    })
      .then((r) => {
        if (!r.ok)
          return r.json().then((d) => Promise.reject(new Error(d.error?.message || "Erro")));
        return r.json();
      })
      .then((newExp) => {
        setExperiments((prev) => [newExp, ...prev]);
        setShowForm(false);
        setForm({
          name: "",
          description: "",
          startDate: format(new Date(), "yyyy-MM-dd"),
          endDate: format(
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            "yyyy-MM-dd"
          ),
          targetMetric: "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setSubmitting(false));
  }

  if (loading)
    return (
      <p className="text-muted-foreground animate-pulse-soft">Carregando...</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="science" size={28} className="text-accent" />
          Modo experimento
        </h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground font-medium hover:opacity-90 transition-all duration-200 flex items-center gap-2"
        >
          <Icon name="add" size={20} />
          {showForm ? "Cancelar" : "Novo experimento"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl animate-scale-in"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="add_circle" size={22} className="text-accent" />
            Criar experimento
          </h2>
          <div>
            <label className={labelClass}>Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>
              Métrica alvo (ex: 90 min deep work diário)
            </label>
            <input
              type="text"
              value={form.targetMetric}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetMetric: e.target.value }))
              }
              className={inputClass}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Início</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Fim</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <Icon name="error" size={18} />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            <Icon name="save" size={18} />
            {submitting ? "Salvando..." : "Criar"}
          </button>
        </form>
      )}

      {error && !showForm && (
        <p className="text-red-400 text-sm flex items-center gap-1.5">
          <Icon name="error" size={18} />
          {error}
        </p>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold text-foreground">Experimentos</h2>
        {experiments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum experimento. Crie um para acompanhar compliance e correlação
            com autonomia/XP.
          </p>
        ) : (
          <ul className="space-y-3">
            {experiments.map((exp) => (
              <li
                key={exp.id}
                className="rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/experiments/${exp.id}`}
                      className="font-medium text-foreground hover:text-accent transition-colors duration-200"
                    >
                      {exp.name}
                    </Link>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {exp.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(exp.startDate), "dd/MM/yyyy")} –{" "}
                      {format(new Date(exp.endDate), "dd/MM/yyyy")} ·{" "}
                      {exp.targetMetric}
                    </p>
                    {exp.complianceLog && (
                      <p className="text-xs text-muted-foreground">
                        {exp.complianceLog.filter((e) => e.completed).length} /{" "}
                        {exp.complianceLog.length} dias em compliance
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/experiments/${exp.id}`}
                    className="text-sm text-accent hover:underline flex items-center gap-1 shrink-0"
                  >
                    Ver detalhes
                    <Icon name="arrow_forward" size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
