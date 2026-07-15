"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao entrar");
      router.push(from.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-scale-in">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Icon name="login" size={28} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-400">
              <Icon name="error" size={18} />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent py-3 font-medium text-accent-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse-soft">Entrando...</span>
            ) : (
              <>
                <Icon name="login" size={20} />
                Entrar
              </>
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="text-accent transition-colors duration-200 hover:underline"
          >
            Cadastrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <p className="animate-pulse-soft text-muted-foreground">Carregando...</p>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
