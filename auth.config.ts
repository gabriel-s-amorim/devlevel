import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/entries", "/reflection", "/experiments"];
const AUTH_PAGES = ["/login", "/register"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Edge-compatible Auth.js config (no Prisma / bcrypt).
 * Used by middleware; full providers live in auth.ts.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (isProtected(pathname) && !isLoggedIn) {
        const login = new URL("/login", request.nextUrl.origin);
        login.searchParams.set("from", pathname);
        return NextResponse.redirect(login);
      }

      if (AUTH_PAGES.includes(pathname) && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
