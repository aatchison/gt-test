import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DUMMY_HASH =
  "$2a$12$LHDiLCLdUmEWBMIw4GfMsOf9eGlpJeprjPE7bFJuN4cTHrIv6xzq6";

const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function resetLoginAttempts(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ loginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));
}

async function incrementLoginAttempts(
  userId: string,
  currentAttempts: number | null
): Promise<void> {
  const attempts = (currentAttempts ?? 0) + 1;
  const lockedUntil =
    attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION_MS)
      : null;

  await db
    .update(users)
    .set({ loginAttempts: attempts, lockedUntil })
    .where(eq(users.id, userId));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string)
          .trim()
          .toLowerCase();

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .get();

        const passwordHash = user?.passwordHash ?? DUMMY_HASH;
        const isValidPassword = await bcrypt.compare(
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
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
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
});
