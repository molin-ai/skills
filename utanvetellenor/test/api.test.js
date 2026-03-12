import test from "node:test";
import assert from "node:assert/strict";
import { isSuccessfulApiBody } from "../src/api.js";

test("isSuccessfulApiBody accepts legacy zero status", () => {
  assert.equal(isSuccessfulApiBody("request", { status: 0 }), true);
});

test("isSuccessfulApiBody accepts observed request success status 200", () => {
  assert.equal(isSuccessfulApiBody("request", { status: 200, result: {} }), true);
});

test("isSuccessfulApiBody accepts observed request no-signals status 404", () => {
  assert.equal(
    isSuccessfulApiBody("request", { status: 404, result: { reason: "No Signals were found." } }),
    true
  );
});

test("isSuccessfulApiBody accepts observed signal success status 200", () => {
  assert.equal(isSuccessfulApiBody("signal", { status: 200, details: "Submission successful - thank you!" }), true);
});

test("isSuccessfulApiBody rejects explicit API errors", () => {
  assert.equal(isSuccessfulApiBody("request", { error: "bad" }), false);
});
