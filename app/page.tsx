import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(34,197,94,0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(250,250,250,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(250,250,250,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 md:px-8">
        <p className="mb-6 animate-fade-in text-sm font-medium uppercase tracking-[0.2em] text-accent">
          DevLevel
        </p>

        <h1 className="animate-fade-in text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          O hábito angular da sua carreira como{" "}
          <span className="text-accent">desenvolvedor</span>
        </h1>

        <p
          className="mt-6 max-w-xl animate-slide-up text-lg leading-relaxed text-muted-foreground opacity-0"
          style={{ animationDelay: "0.12s" }}
        >
          Em <em>O Poder do Hábito</em>, Charles Duhigg descreve o hábito-chave
          que desencadeia outros. DevLevel parte dessa ideia: registrar e
          refletir sobre o trabalho diário é o loop que alavanca deep work,
          autonomia e evolução técnica.
        </p>

        <div
          className="mt-10 flex flex-wrap gap-4 animate-slide-up opacity-0"
          style={{ animationDelay: "0.22s" }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl gradient-accent px-6 py-3.5 font-medium text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="person_add" size={20} />
            Começar agora
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3.5 text-foreground backdrop-blur transition-all duration-200 hover:scale-[1.02] hover:border-accent/40 hover:bg-muted active:scale-[0.98]"
          >
            <Icon name="login" size={20} />
            Entrar
          </Link>
        </div>

        <p
          className="mt-16 max-w-lg animate-slide-up text-sm text-muted-foreground/80 opacity-0"
          style={{ animationDelay: "0.35s" }}
        >
          Journal diário · XP e níveis · Streaks · Reflexão semanal · Experimentos
          com correlação de compliance
        </p>
      </div>
    </main>
  );
}
