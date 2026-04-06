import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function generateVerificationToken(identifier: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Remove any existing tokens for this identifier
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));

  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires,
  });

  return token;
}

export async function verifyVerificationToken(identifier: string, token: string) {
  const result = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token)
      )
    )
    .get();

  if (!result || result.expires < new Date()) {
    return null;
  }

  return result;
}
