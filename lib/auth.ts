import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";

async function generateDummyHash() {
  const crypto = await import("crypto");
  const bcrypt = await import("bcryptjs");
  const random = crypto.default.randomBytes(16).toString("hex");
  return await bcrypt.default.hash(random, 12);
}

async function resetLoginAttempts(userId: string): Promise<void> {
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  await db
    .update(users)
    .set({ loginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));
}

async function incrementLoginAttempts(
  userId: string,
  currentAttempts: number | null
): Promise<void> {
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const attempts = (currentAttempts ?? 0) + 1;
  const lockedUntil =
    attempts >= 10
      ? new Date(Date.now() + 15 * 60 * 1000)
      : null;

  await db
    .update(users)
    .set({ loginAttempts: attempts, lockedUntil })
    .where(eq(users.id, userId));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, unknown>) {
        if (!credentials?.email || !credentials?.password) return null;

        const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");

        const { eq } = await import("drizzle-orm");
        const bcrypt = await import("bcryptjs");

        const normalizedEmail = (credentials.email as string)
          .trim()
          .toLowerCase();

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .get();

        let passwordHash: string;
        if (user?.passwordHash) {
          passwordHash = user.passwordHash;
        } else {
          passwordHash = await generateDummyHash();
        }
        const isValidPassword = await bcrypt.default.compare(
          credentials.password as string,
          passwordHash
        );

        if (!user) {
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 50));
          return null;
        }

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 50));
          return null;
        }

        if (!user.emailVerified) {
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 50));
          return null;
        }

        if (!isValidPassword) {
          await incrementLoginAttempts(user.id, user.loginAttempts);
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 50));
          return null;
        }

        if (user.loginAttempts && user.loginAttempts > 0) {
          await resetLoginAttempts(user.id);
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "__Secure-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  trustHost: true,
})
