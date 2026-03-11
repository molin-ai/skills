import test from "node:test";
import assert from "node:assert/strict";
import { parseArgv } from "../src/args.js";

test("parseArgv supports repeated set flags and negative values", () => {
  const parsed = parseArgv([
    "refund",
    "--set",
    "Transactions.0.Total=19990",
    "--set",
    "Transactions.0.Comment=\"test\"",
    "--outcome",
    "-1"
  ]);

  assert.equal(parsed.command, "refund");
  assert.deepEqual(parsed.options.set, ["Transactions.0.Total=19990", "Transactions.0.Comment=\"test\""]);
  assert.equal(parsed.options.outcome, "-1");
});

test("parseArgv normalizes command aliases", () => {
  const parsed = parseArgv(["finish-reservation"]);
  assert.equal(parsed.command, "finishReservation");
});
