"use client";

import { useEffect, useState } from "react";
import { startOfWeek, format } from "date-fns";
import { Icon } from "@/components/ui/Icon";

interface Reflection {
  id: string;
  weekStartDate: string;
  whatDidILearn?: string;
  whereDidIImprove?: string;
  mainChallenge?: string;
  autonomyAverage?: number;
}

const inputClass =
  "w-full border border-border rounded-xl bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

const emptyForm = () => ({
  weekStartDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  whatDidILearn: "",
  whereDidIImprove: "",
  mainChallenge: "",
  autonomyAverage: "",
});

export default function ReflectionPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadReflections() {
    return fetch("/api/reflections", { credentials: "include" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Falha ao carregar"))
      )
      .then((data) => setReflections(data.reflections || []))
      .catch(() => setError("Erro ao carregar reflexões"));
  }

  useEffect(() => {
    loadReflections().finally(() => setLoading(false));
  }, []);

  function startEdit(r: Reflection) {
    setEditingId(r.id);
    setForm({
      weekStartDate: format(new Date(r.weekStartDate), "yyyy-MM-dd"),
      whatDidILearn: r.whatDidILearn ?? "",
      whereDidIImprove: r.whereDidIImprove ?? "",
      mainChallenge: r.mainChallenge ?? "",
      autonomyAverage:
        r.autonomyAverage != null ? String(r.autonomyAverage) : "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      weekStartDate: form.weekStartDate,
      whatDidILearn: form.whatDidILearn || undefined,
      whereDidIImprove: form.whereDidIImprove || undefined,
      mainChallenge: form.mainChallenge || undefined,
      autonomyAverage: form.autonomyAverage
        ? Number(form.autonomyAverage)
        : undefined,
    };

    const url = editingId ? `/api/reflections/${editingId}` : "/api/reflections";
    const method = editingId ? "PATCH" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok)
          return r
            .json()
            .then((d) =>
              Promise.reject(
                new Error(
                  typeof d.error === "string"
                    ? d.error
                    : d.error?.message || "Erro"
                )
              )
            );
        return r.json();
      })
      .then(() => {
        cancelEdit();
        return loadReflections();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta reflexão? Esta ação não pode ser desfeita."))
      return;
    setDeletingId(id);
    setError(null);
    fetch(`/api/reflections/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok)
          return r
            .json()
            .then((d) =>
              Promise.reject(new Error(d.error || "Erro ao excluir"))
            );
      })
      .then(() => loadReflections())
      .catch((err) => setError(err.message))
      .finally(() => setDeletingId(null));
  }

  if (loading)
    return (
      <p className="animate-pulse-soft text-muted-foreground">Carregando...</p>
    );

  return (
    <div className="space-y-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <Icon name="psychology" size={28} className="text-accent" />
        Reflexão semanal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <Icon name="add_circle" size={22} className="text-accent" />
          {editingId ? "Editar reflexão" : "Nova reflexão"}
        </h2>
        <div>
          <label className={labelClass}>Semana (início)</label>
          <input
            type="date"
            value={form.weekStartDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, weekStartDate: e.target.value }))
            }
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>O que aprendi</label>
          <textarea
            value={form.whatDidILearn}
            onChange={(e) =>
              setForm((f) => ({ ...f, whatDidILearn: e.target.value }))
            }
            className={inputClass}
            rows={2}
          />
        </div>
        <div>
          <label className={labelClass}>Onde melhorei</label>
          <textarea
            value={form.whereDidIImprove}
            onChange={(e) =>
              setForm((f) => ({ ...f, whereDidIImprove: e.target.value }))
            }
            className={inputClass}
            rows={2}
          />
        </div>
        <div>
          <label className={labelClass}>Principal desafio</label>
          <textarea
            value={form.mainChallenge}
            onChange={(e) =>
              setForm((f) => ({ ...f, mainChallenge: e.target.value }))
            }
            className={inputClass}
            rows={2}
          />
        </div>
        <div>
          <label className={labelClass}>Média de autonomia (0-10)</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={form.autonomyAverage}
            onChange={(e) =>
              setForm((f) => ({ ...f, autonomyAverage: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-400">
            <Icon name="error" size={18} />
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl gradient-accent px-4 py-2.5 font-medium text-accent-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="save" size={18} />
            {submitting
              ? "Salvando..."
              : editingId
                ? "Atualizar"
                : "Salvar reflexão"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-border px-4 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Reflexões anteriores</h2>
        {reflections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma reflexão ainda.</p>
        ) : (
          <ul className="space-y-3">
            {reflections.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Semana de {format(new Date(r.weekStartDate), "dd/MM/yyyy")}
                    </p>
                    {r.whatDidILearn && (
                      <p className="mt-1 text-foreground">
                        <span className="text-muted-foreground">Aprendi:</span>{" "}
                        {r.whatDidILearn}
                      </p>
                    )}
                    {r.whereDidIImprove && (
                      <p className="mt-1 text-foreground">
                        <span className="text-muted-foreground">Melhorei:</span>{" "}
                        {r.whereDidIImprove}
                      </p>
                    )}
                    {r.mainChallenge && (
                      <p className="mt-1 text-foreground">
                        <span className="text-muted-foreground">Desafio:</span>{" "}
                        {r.mainChallenge}
                      </p>
                    )}
                    {r.autonomyAverage != null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Autonomia média: {r.autonomyAverage}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Icon name="delete" size={16} />
                      {deletingId === r.id ? "..." : "Excluir"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
