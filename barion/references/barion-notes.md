# Barion Notes

Official docs researched:

- endpoint list
- payment start
- payment state
- complete
- finish reservation
- capture
- cancel authorization
- refund

Official endpoint set used by this CLI:

- `POST /v2/Payment/Start`
- `GET /v4/payment/{PaymentId}/paymentstate`
- `POST /v2/Payment/Complete`
- `POST /v2/Payment/FinishReservation`
- `POST /v2/Payment/Capture`
- `POST /v2/Payment/CancelAuthorization`
- `POST /v2/Payment/Refund`

Environment defaults used by this CLI:

- sandbox: `https://api.test.barion.com`
- production: `https://api.barion.com`

Ecommerce perspective:

- `start` is the main checkout handoff
- `state` is the main reconciliation command
- the other commands are lifecycle operations after payment start

Practical note:

- for complex Barion requests, file-based JSON plus `--set` overrides is more reliable than dozens of ad hoc flags
- Barion docs show payment ids both as GUID-typed values and as 32-hex path examples, so this CLI accepts either hyphenated UUIDs or 32-hex identifiers
- state authentication follows the documented `x-pos-key` header flow
- finish/capture use `TransactionToFinish` entries keyed by `TransactionId`
- refund uses `TransactionsToRefund` entries keyed by `TransactionId`, `POSTransactionId`, and `AmountToRefund`
