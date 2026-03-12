# CLI Workflow

## Setup

Inspect config:

```bash
node ./src/cli.js doctor
node ./src/cli.js config show
```

Configure the POS key:

```bash
node ./src/cli.js config init --pos-key YOUR_POS_KEY --sandbox
```

Credential precedence:

1. `--pos-key`
2. `BARION_POS_KEY`
3. local config file

## Input Pattern

For complex requests prefer:

1. `--data-file`
2. `--stdin`
3. `--set path=value` overrides

Examples:

```bash
node ./src/cli.js start --dry-run --data-file ./examples/start.json
node ./src/cli.js start --data-file ./examples/start.json --set Transactions.0.Total=24990
node ./src/cli.js state --payment-id 11111111111111118111111111111111 --dry-run
```

## Command Summary

Use `start` to create a payment session.

Use `state` to reconcile a payment by `paymentId`.

Use `complete` only for prepared and 3DS-authenticated token-payment style flows.

Use `finish-reservation` for reservation-to-finalization flow.

Use `capture` for delayed capture.

Use `cancel-authorization` to release an authorization.

Use `refund` after settlement when money should be returned.

Important transaction-id note:

- `finish-reservation` and `capture` use Barion `TransactionId`
- `refund` uses `TransactionId`, `POSTransactionId`, and `AmountToRefund`
- get these from the original payment state/transaction data before calling the lifecycle endpoint

## Safe Pattern

1. build the request body
2. run `--dry-run`
3. send the live request
4. store `PaymentId`, `PaymentRequestId`, and `POSTransactionId`
5. reconcile with callback plus `state`

## State Notes

This CLI uses the Barion v4 state route:

```text
GET /v4/payment/{PaymentId}/paymentstate
```

It sends `x-pos-key` header auth by default.
