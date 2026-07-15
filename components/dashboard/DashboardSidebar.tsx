"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/entries", label: "Entradas", icon: "edit_note" },
  { href: "/reflection", label: "Reflexão", icon: "psychology" },
  { href: "/experiments", label: "Experimentos", icon: "science" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-2 border-r border-border bg-card/50 p-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-semibold text-foreground transition-colors duration-200 hover:text-accent"
      >
        <Icon name="terminal" size={28} className="text-accent" />
        DevLevel
      </Link>
      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon name={icon} size={22} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <LogoutButton />
      </div>
    </aside>
  );
}
