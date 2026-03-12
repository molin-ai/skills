# Ecommerce Workflows

## Start Payment

Use `start` when:

- the cart is finalized
- amount and items are stable
- the order is ready to hand off to payment

Before calling `start`:

- generate a stable `PaymentRequestId`
- generate stable `POSTransactionId` values tied to your order records
- set valid `RedirectUrl` and `CallbackUrl`

After a successful `start`:

- store `PaymentId`
- store `GatewayUrl`
- redirect the shopper

## Reconcile Payment

Use `state` when:

- Barion redirects the shopper back
- your callback endpoint receives an update
- a retry or reconciliation job runs
- support needs to inspect a payment

Recommended rule:

- treat callback as a trigger to re-check state, not as the only source of truth

## Redirect Finalization

Use `complete` only if your Barion flow is a prepared and 3DS-authenticated token-payment style flow that requires explicit completion.

## Reservation And Capture

Use `finish-reservation` when reserved money should become final.

Use `capture` when authorization and final capture are separate in your checkout flow.

Use `cancel-authorization` when reserved funds should be released instead of captured.

Before `finish-reservation` or `capture`, fetch or retain the Barion transaction ids linked to the payment.

## Refunds

Use `refund` only after the payment has succeeded and your business workflow has decided money should be returned.

Keep the refund linked to your internal order, RMA, and support records.

Refund input should be built from known Barion transaction data:

- `TransactionId`
- `POSTransactionId`
- `AmountToRefund`
