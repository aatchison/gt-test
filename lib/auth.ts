import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Precomputed hash used when the email is not found, to prevent timing attacks
// that could reveal whether an account exists for a given email.
const DUMMY_HASH =
  "$2a$12$LHDiLCLdUmEWBMIw4GfMsOf9eGlpJeprjPE7bFJuN4cTHrIv6xzq6";

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

        // Normalize email so login works regardless of capitalisation
        const normalizedEmail = (credentials.email as string)
          .trim()
          .toLowerCase();

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .get();

        // Always run bcrypt.compare to prevent timing-based user enumeration
        const valid = await bcrypt.compare(
          credentials.password as string,
          user?.passwordHash ?? DUMMY_HASH
        );

        if (!user || !valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
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
});
