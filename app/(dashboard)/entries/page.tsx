"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Icon } from "@/components/ui/Icon";

interface Entry {
  id: string;
  date: string;
  projectName?: string;
  entryType: string;
  description?: string;
  learned?: string;
  difficulty?: number;
  autonomyScore?: number;
  deepWorkBlockCompleted: boolean;
  interruptionManagedWell: boolean;
}

const ENTRY_TYPES = [
  { value: "project", label: "Projeto" },
  { value: "incident", label: "Incidente" },
  { value: "study", label: "Estudo" },
];

const inputClass =
  "w-full border border-border rounded-xl bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    projectName: "",
    entryType: "project" as "project" | "incident" | "study",
    description: "",
    learned: "",
    difficulty: 3,
    autonomyScore: 5,
    deepWorkBlockCompleted: false,
    interruptionManagedWell: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadEntries() {
    fetch("/api/entries", { credentials: "include" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Falha ao carregar"))
      )
      .then((data) => setEntries(data.entries || []))
      .catch(() => setError("Erro ao carregar entradas"));
  }

  useEffect(() => {
    loadEntries();
    setLoading(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        date: form.date,
        projectName: form.projectName || undefined,
        entryType: form.entryType,
        description: form.description || undefined,
        learned: form.learned || undefined,
        difficulty: form.difficulty,
        autonomyScore: form.autonomyScore,
        deepWorkBlockCompleted: form.deepWorkBlockCompleted,
        interruptionManagedWell: form.interruptionManagedWell,
      }),
    })
      .then((r) => {
        if (!r.ok)
          return r.json().then((d) => Promise.reject(new Error(d.error?.message || "Erro")));
        return r.json();
      })
      .then(() => {
        loadEntries();
        setShowForm(false);
        setForm({
          date: format(new Date(), "yyyy-MM-dd"),
          projectName: "",
          entryType: "project",
          description: "",
          learned: "",
          difficulty: 3,
          autonomyScore: 5,
          deepWorkBlockCompleted: false,
          interruptionManagedWell: false,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setSubmitting(false));
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta entrada? Esta ação não pode ser desfeita."))
      return;
    setDeletingId(id);
    setError(null);
    fetch(`/api/entries/${id}`, { method: "DELETE", credentials: "include" })
      .then((r) => {
        if (!r.ok)
          return r.json().then((d) => Promise.reject(new Error(d.error || "Erro ao excluir")));
      })
      .then(() => loadEntries())
      .catch((e) => setError(e.message))
      .finally(() => setDeletingId(null));
  }

  if (loading)
    return (
      <p className="text-muted-foreground animate-pulse-soft">Carregando...</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="edit_note" size={28} className="text-accent" />
          Entradas diárias
        </h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground font-medium hover:opacity-90 transition-all duration-200 flex items-center gap-2"
        >
          <Icon name="add" size={20} />
          {showForm ? "Cancelar" : "Nova entrada"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl animate-scale-in"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="add_circle" size={22} className="text-accent" />
            Nova entrada
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                value={form.entryType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    entryType: e.target.value as "project" | "incident" | "study",
                  }))
                }
                className={inputClass}
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Projeto</label>
            <input
              type="text"
              value={form.projectName}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectName: e.target.value }))
              }
              className={inputClass}
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
            <label className={labelClass}>Aprendizado</label>
            <textarea
              value={form.learned}
              onChange={(e) =>
                setForm((f) => ({ ...f, learned: e.target.value }))
              }
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dificuldade (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Autonomia (0-10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.autonomyScore}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    autonomyScore: Number(e.target.value),
                  }))
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.deepWorkBlockCompleted}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deepWorkBlockCompleted: e.target.checked,
                  }))
                }
                className="rounded border-border"
              />
              <span className="text-sm">Bloco deep work concluído</span>
            </label>
            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.interruptionManagedWell}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    interruptionManagedWell: e.target.checked,
                  }))
                }
                className="rounded border-border"
              />
              <span className="text-sm">Interrupção bem gerida</span>
            </label>
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
            {submitting ? "Salvando..." : "Salvar entrada"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold text-foreground">Últimas entradas</h2>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma entrada. Adicione uma para acumular XP e streaks.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-border bg-card p-4 flex justify-between gap-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(e.date), "dd/MM/yyyy")} ·{" "}
                    {ENTRY_TYPES.find((t) => t.value === e.entryType)?.label ??
                      e.entryType}
                    {e.projectName && ` · ${e.projectName}`}
                  </p>
                  {e.description && (
                    <p className="mt-1 text-sm text-foreground">
                      {e.description}
                    </p>
                  )}
                  {e.learned && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aprendi: {e.learned}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                    {e.difficulty != null && (
                      <span>Dificuldade: {e.difficulty}</span>
                    )}
                    {e.autonomyScore != null && (
                      <span>Autonomia: {e.autonomyScore}</span>
                    )}
                    {e.deepWorkBlockCompleted && <span>Deep work</span>}
                    {e.interruptionManagedWell && <span>Interrupção ok</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  disabled={deletingId === e.id}
                  className="shrink-0 self-start px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50 flex items-center gap-1"
                >
                  <Icon name="delete" size={16} />
                  {deletingId === e.id ? "Excluindo..." : "Excluir"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
