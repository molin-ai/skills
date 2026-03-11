import test from "node:test";
import assert from "node:assert/strict";
import { parseArgv } from "../src/args.js";

test("parseArgv reads command, subcommand, flags, and positionals", () => {
  const parsed = parseArgv([
    "config",
    "set",
    "--sandbox",
    "--timeout-ms",
    "5000",
    "publicKey",
    "value"
  ]);

  assert.equal(parsed.command, "config");
  assert.equal(parsed.subcommand, "set");
  assert.equal(parsed.options.sandbox, true);
  assert.equal(parsed.options.timeoutMs, "5000");
  assert.deepEqual(parsed.positionals, ["publicKey", "value"]);
});

test("parseArgv accepts negative numeric values after long flags", () => {
  const parsed = parseArgv([
    "signal",
    "--email",
    "customer@example.com",
    "--order-id",
    "ORDER-1",
    "--outcome",
    "-1"
  ]);

  assert.equal(parsed.command, "signal");
  assert.equal(parsed.options.outcome, "-1");
});
