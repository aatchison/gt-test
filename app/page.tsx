import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold">My App</h1>
        <p className="text-gray-500">A full-stack Next.js application.</p>

        {session?.user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Signed in as <strong>{session.user.email}</strong>
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
