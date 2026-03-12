import test from "node:test";
import assert from "node:assert/strict";
import { normalizePayload, validateRequestPayload, validateSignalPayload } from "../src/validation.js";

test("request payload accepts the documented minimum fields", () => {
  const payload = normalizePayload({
    email: "customer@example.com",
    threshold: "0.8"
  });

  assert.equal(validateRequestPayload(payload).threshold, 0.8);
});

test("request payload rejects partial extended identity fields", () => {
  const payload = normalizePayload({
    email: "customer@example.com",
    threshold: 0.8,
    phoneNumber: "+36301234567"
  });

  assert.throws(() => validateRequestPayload(payload), /countryCode/);
});

test("signal payload accepts required fields", () => {
  const payload = normalizePayload({
    email: "customer@example.com",
    orderId: "ORDER-1",
    outcome: "-1"
  });

  assert.equal(validateSignalPayload(payload).outcome, -1);
});

test("signal payload rejects unsupported outcome values", () => {
  const payload = normalizePayload({
    email: "customer@example.com",
    orderId: "ORDER-1",
    outcome: "0"
  });

  assert.throws(() => validateSignalPayload(payload), /outcome must be 1/);
});
