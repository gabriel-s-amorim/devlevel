"use client";

import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
    >
      <Icon name="logout" size={22} />
      Sair
    </button>
  );
}
