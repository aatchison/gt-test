import type { Metadata } from "next";
import "./globals.css";

// Force all routes to render dynamically — required for next-auth v5 session handling.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My App",
  description: "A Next.js full-stack application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
