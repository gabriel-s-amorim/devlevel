import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLevel — Tracking comportamental para desenvolvedores",
  description:
    "Registre, reflita e evolua. DevLevel transforma o journal diário no hábito angular da sua carreira como desenvolvedor — com XP, streaks e experimentos comportamentais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
