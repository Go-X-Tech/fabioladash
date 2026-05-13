import test from "node:test";
import assert from "node:assert/strict";

import { resolveDashboardDateRange } from "../../app/dashboard/lib.ts";

test("resolveDashboardDateRange clamps custom end dates that are in the future", () => {
  const { range, preset } = resolveDashboardDateRange(
    {
      preset: "custom",
      starts_at: "2026-05-01",
      ends_at: "2026-05-31",
    },
    new Date("2026-05-12T12:00:00Z")
  );

  assert.equal(preset, "custom");
  assert.equal(range.startsAt, "2026-05-01");
  assert.equal(range.endsAt, "2026-05-12");
});
