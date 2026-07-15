import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validators/auth";
import { handleApiError } from "@/lib/utils/errors";
import { checkAuthRateLimit } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuthRateLimit(request, "login"))) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 15 minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: "Email ou senha inválidos" },
          { status: 401 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
