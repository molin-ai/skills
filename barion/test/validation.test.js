import test from "node:test";
import assert from "node:assert/strict";
import { validatePostPayload, validateStatePayload } from "../src/validation.js";

test("validate state payload accepts UUID paymentId", () => {
  const payload = validateStatePayload({ paymentId: "11111111-1111-1111-8111-111111111111" });
  assert.equal(payload.paymentId, "11111111-1111-1111-8111-111111111111");
});

test("validate state payload accepts 32 hex paymentId", () => {
  const payload = validateStatePayload({ paymentId: "11111111111111118111111111111111" });
  assert.equal(payload.paymentId, "11111111111111118111111111111111");
});

test("validate start payload requires transactions", () => {
  assert.throws(
    () =>
      validatePostPayload("start", {
        PaymentRequestId: "x",
        PaymentType: "Immediate",
        Currency: "HUF",
        Transactions: []
      }),
    /Transactions/
  );
});

test("validate lifecycle payload requires PaymentId", () => {
  assert.throws(() => validatePostPayload("refund", {}), /PaymentId/);
});

test("validate refund payload requires TransactionsToRefund entries with AmountToRefund", () => {
  assert.throws(
    () =>
      validatePostPayload("refund", {
        PaymentId: "11111111111111118111111111111111",
        TransactionsToRefund: [{ POSTransactionId: "ORDER-1" }]
      }),
    /TransactionId/
  );
});
