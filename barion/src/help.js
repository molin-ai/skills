const TOPIC_HELP = {
  overview: `barion - Barion CLI

Usage:
  barion help [overview|start|state|lifecycle|config|ai]
  barion version
  barion config init --pos-key KEY [--sandbox]
  barion config set <posKey|sandbox|timeoutMs|baseUrl> <value>
  barion config show [--json] [--reveal-secrets]
  barion config path
  barion doctor [--json]
  barion start [options]
  barion state --payment-id ID [options]
  barion complete [options]
  barion finish-reservation [options]
  barion capture [options]
  barion cancel-authorization [options]
  barion refund [options]
  barion template <start|state|complete|finish-reservation|capture|cancel-authorization|refund>

What this CLI does:
  - starts Barion payments
  - fetches payment state
  - supports prepared/3DS token-payment completion
  - supports reservation/capture/cancel/refund lifecycle calls

Global options:
  --config PATH
  --pos-key KEY
  --sandbox
  --production
  --base-url URL
  --timeout-ms NUMBER
  --json
  --dry-run
  --data-file PATH
  --stdin
  --set path=value

Fast start:
  barion config init --pos-key POSKEY --sandbox
  barion start --dry-run --data-file ./examples/start.json
  barion state --dry-run --payment-id 11111111111111118111111111111111

More help:
  barion help start
  barion help state
  barion help lifecycle
  barion help config
  barion help ai
`,

  start: `barion help start

Use start for checkout initialization.

Recommended flow:
  1. build a full payment body in JSON
  2. run --dry-run
  3. send live request
  4. redirect shopper to GatewayUrl from the response
  5. reconcile payment with callback + state checks

Preferred input:
  barion start --data-file ./examples/start.json --dry-run

Useful fields in a typical ecommerce start request:
  PaymentType
  GuestCheckOut
  FundingSources
  PaymentRequestId
  PayerHint
  Locale
  Currency
  RedirectUrl
  CallbackUrl
  Transactions

Add or override fields with:
  --set Transactions.0.POSTransactionId=ORDER-10001
  --set Transactions.0.Total=19990
`,

  state: `barion help state

Use state to reconcile Barion payment status after callback, redirect return, cron repair, or admin investigation.

Examples:
  barion state --payment-id 11111111111111118111111111111111 --dry-run
  barion state --payment-id 11111111111111118111111111111111 --json

Notes:
  - state uses the v4 payment state endpoint
  - state uses x-pos-key header auth by default
  - state uses documented header auth only
`,

  lifecycle: `barion help lifecycle

Use complete only for prepared and 3DS-authenticated token-payment style flows.

Use finish-reservation when reserved funds should be finalized.

Use capture for delayed capture / authorization flows.

Use cancel-authorization to release an authorization.

Use refund after a successful payment when money should be sent back.

Notes:
  - finish-reservation and capture need Barion transaction ids from the payment
  - refund needs TransactionId, POSTransactionId, and AmountToRefund
  - use payment state data to obtain transaction ids before these calls

All lifecycle commands support:
  --data-file
  --stdin
  --set path=value
  --json
  --dry-run
`,

  config: `barion help config

Credential precedence:
  1. --pos-key
  2. BARION_POS_KEY
  3. config file

Environment variables:
  BARION_POS_KEY
  BARION_SANDBOX
  BARION_TIMEOUT_MS
  BARION_BASE_URL

Config commands:
  barion config init --pos-key KEY --sandbox
  barion config set sandbox true
  barion config set timeoutMs 20000
  barion config show
  barion config path
`,

  ai: `barion help ai

AI handoff:
  - use this CLI for Barion ecommerce payment flows
  - prefer JSON files and --dry-run for complex requests
  - use start before checkout redirect
  - use state after callback or redirect return
  - use complete only for prepared and 3DS-authenticated token-payment flows
  - use finish-reservation, capture, cancel-authorization, refund as lifecycle calls after payment start
  - do not rely only on browser return; reconcile with callback + state
  - keep PaymentRequestId and POSTransactionId stable and traceable to order records
`
};

export function getHelpText(topic = "overview") {
  return TOPIC_HELP[(topic || "overview").toLowerCase()] || TOPIC_HELP.overview;
}
