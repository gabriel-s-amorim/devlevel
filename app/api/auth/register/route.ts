import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { registerSchema } from "@/lib/validators/auth";
import * as authService from "@/lib/services/authService";
import { handleApiError } from "@/lib/utils/errors";
import { checkAuthRateLimit } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuthRateLimit(request, "register"))) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 15 minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const user = await authService.registerUser(name, email, password);

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: "Conta criada, mas falha ao iniciar sessão. Faça login." },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
