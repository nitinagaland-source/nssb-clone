"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="surface-elevated p-10 text-center"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <div className="h-14 w-14 mx-auto rounded-2xl grad-rose shadow-glow-rose text-white flex items-center justify-center">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-display text-xl font-bold mt-4">Something went wrong</h2>
      <p className="text-sm text-[color:var(--text-secondary)] mt-1 max-w-md mx-auto">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <Button variant="outline" className="mt-5" onClick={reset}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
