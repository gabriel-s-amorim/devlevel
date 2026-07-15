import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@/lib/validators/auth";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

describe("auth validators", () => {
  it("rejects short passwords on register", () => {
    const result = registerSchema.safeParse({
      name: "Demo",
      email: "demo@devlevel.app",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      name: "Demo User",
      email: "demo@devlevel.app",
      password: "demo1234",
    });
    expect(result.success).toBe(true);
  });

  it("requires email and password on login", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
      false
    );
    expect(
      loginSchema.safeParse({
        email: "demo@devlevel.app",
        password: "demo1234",
      }).success
    ).toBe(true);
  });
});

describe("register/login service flow", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreate.mockReset();
  });

  it("registers a new user when email is free", async () => {
    const { registerUser } = await import("@/lib/services/authService");

    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({
      id: "user_1",
      email: "demo@devlevel.app",
      name: "Demo",
    });

    const user = await registerUser("Demo", "demo@devlevel.app", "demo1234");
    expect(user.id).toBe("user_1");
    expect(user.email).toBe("demo@devlevel.app");
    expect(mockCreate).toHaveBeenCalledOnce();
    const createArg = mockCreate.mock.calls[0][0];
    expect(createArg.data.email).toBe("demo@devlevel.app");
    expect(createArg.data.passwordHash).toBeTruthy();
    expect(createArg.data.passwordHash).not.toBe("demo1234");
  });

  it("rejects duplicate email on register", async () => {
    const { registerUser } = await import("@/lib/services/authService");
    const { AppError } = await import("@/lib/utils/errors");

    mockFindUnique.mockResolvedValueOnce({ id: "existing" });

    await expect(
      registerUser("Demo", "demo@devlevel.app", "demo1234")
    ).rejects.toBeInstanceOf(AppError);
  });

  it("verifies password hash matches for login authorize path", async () => {
    const password = "demo1234";
    const passwordHash = await bcrypt.hash(password, 10);
    const ok = await bcrypt.compare(password, passwordHash);
    expect(ok).toBe(true);
    expect(await bcrypt.compare("wrong", passwordHash)).toBe(false);
  });
});
