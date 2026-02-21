import type { NextPageContext } from "next";

// Minimal Pages Router error page — overrides Next.js default which
// imports <Html> from next/document, incompatible with next-auth v5 beta.
function Error({ statusCode }: { statusCode: number }) {
  return (
    <main style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <p>{statusCode} — An error occurred.</p>
    </main>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default Error;
