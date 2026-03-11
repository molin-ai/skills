import test from "node:test";
import assert from "node:assert/strict";
import { buildBaseUrl, isApiSuccess } from "../src/api.js";

test("buildBaseUrl returns sandbox by default", () => {
  assert.equal(buildBaseUrl({}), "https://api.test.barion.com");
});

test("buildBaseUrl returns production when sandbox disabled", () => {
  assert.equal(buildBaseUrl({ sandbox: false }), "https://api.barion.com");
});

test("isApiSuccess rejects error payloads", () => {
  assert.equal(isApiSuccess({ Errors: [{ Title: "bad" }] }), false);
});

test("isApiSuccess accepts clean payloads", () => {
  assert.equal(isApiSuccess({ PaymentId: "x" }), true);
});

test("isApiSuccess respects IsSuccessful false", () => {
  assert.equal(isApiSuccess({ IsSuccessful: false }), false);
});
