const BARION_ID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateStatePayload(payload) {
  assert(typeof payload.paymentId === "string" && BARION_ID_PATTERN.test(payload.paymentId), "paymentId must be a Barion payment identifier.");
  return payload;
}

export function validatePostPayload(command, payload) {
  if (command === "start") {
    assert(typeof payload.PaymentRequestId === "string" && payload.PaymentRequestId.trim(), "PaymentRequestId is required.");
    assert(typeof payload.PaymentType === "string" && payload.PaymentType.trim(), "PaymentType is required.");
    assert(typeof payload.Currency === "string" && payload.Currency.trim(), "Currency is required.");
    assert(Array.isArray(payload.Transactions) && payload.Transactions.length > 0, "Transactions must contain at least one transaction.");
  }

  if (["complete", "finishReservation", "capture", "cancelAuthorization", "refund"].includes(command)) {
    assert(typeof payload.PaymentId === "string" && BARION_ID_PATTERN.test(payload.PaymentId), "PaymentId must be a Barion payment identifier.");
  }

  if (["finishReservation", "capture"].includes(command)) {
    assert(Array.isArray(payload.Transactions) && payload.Transactions.length > 0, "Transactions must contain at least one transaction.");

    for (const transaction of payload.Transactions) {
      assert(typeof transaction.TransactionId === "string" && BARION_ID_PATTERN.test(transaction.TransactionId), "Each transaction must include a valid TransactionId.");
      assert(typeof transaction.Total === "number" && Number.isFinite(transaction.Total) && transaction.Total >= 0, "Each transaction Total must be a non-negative number.");
    }
  }

  if (command === "refund") {
    assert(
      Array.isArray(payload.TransactionsToRefund) && payload.TransactionsToRefund.length > 0,
      "TransactionsToRefund must contain at least one transaction."
    );

    for (const transaction of payload.TransactionsToRefund) {
      assert(typeof transaction.TransactionId === "string" && BARION_ID_PATTERN.test(transaction.TransactionId), "Each refund entry must include a valid TransactionId.");
      assert(typeof transaction.POSTransactionId === "string" && transaction.POSTransactionId.trim(), "Each refund entry must include POSTransactionId.");
      assert(
        typeof transaction.AmountToRefund === "number" && Number.isFinite(transaction.AmountToRefund) && transaction.AmountToRefund > 0,
        "Each refund entry AmountToRefund must be a positive number."
      );
    }
  }

  return payload;
}
