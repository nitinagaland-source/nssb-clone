"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "48px 24px",
          background: "#f8f9fc",
          color: "#111827",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "80px auto",
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 20px 40px -20px rgb(0 0 0 / 0.1)",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something broke</h1>
          <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 20 }}>
            {error.message || "An unexpected error happened."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
