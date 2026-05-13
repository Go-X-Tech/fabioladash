import test from "node:test";
import assert from "node:assert/strict";

import { apiFetch } from "../../lib/api.ts";

test("apiFetch surfaces the response body when the API rejects the request", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.CLINICA_API_KEY;
  process.env.CLINICA_API_KEY = "test-key";

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: "ends_at must not be in the future" }), {
      status: 422,
      statusText: "Unprocessable Entity",
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

  try {
    await assert.rejects(
      () => apiFetch("/sales", { starts_at: "2026-05-01", ends_at: "2026-05-31" }, { cache: "no-store" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message.includes("API 422") &&
        error.message.includes("ends_at must not be in the future")
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env.CLINICA_API_KEY;
    } else {
      process.env.CLINICA_API_KEY = originalKey;
    }
  }
});
