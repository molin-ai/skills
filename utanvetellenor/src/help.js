const TOPIC_HELP = {
  overview: `uve - Utanvet-Ellenor CLI

Usage:
  uve help [overview|request|signal|config|ai|responses]
  uve version
  uve config init --public-key KEY --private-key KEY [--sandbox]
  uve config set <publicKey|privateKey|sandbox|timeoutMs> <value>
  uve config show [--json] [--reveal-secrets]
  uve config path
  uve doctor [--json]
  uve request [options]
  uve signal [options]
  uve template <request|signal>
  uve reasons [--json]
  uve status-codes [--json]

What this CLI does:
  - Sends risk-check requests to the Utanvet-Ellenor API
  - Sends later order outcome signals back to the API
  - Stores credentials locally or reads them from environment variables
  - Validates payloads before sending them

Key operating rules:
  - Auth is HTTP Basic using publicKey:privateKey
  - Production base URL: https://www.utanvet-ellenor.hu
  - Sandbox base URL: https://sandbox.utanvet-ellenor.hu
  - Request endpoint: /api/v2/request
  - Signal endpoint: /api/v2/signal
  - Use --dry-run to validate and inspect payloads without sending network calls

Global options:
  --config PATH
  --public-key KEY
  --private-key KEY
  --sandbox
  --production
  --base-url URL
  --timeout-ms NUMBER
  --json
  --dry-run

Fast start:
  uve config init --public-key pk_xxx --private-key sk_xxx --sandbox
  uve request --email customer@example.com --threshold 0.8
  uve signal --email customer@example.com --order-id ORDER-1 --outcome -1

More help:
  uve help request
  uve help signal
  uve help config
  uve help responses
  uve help ai
`,

  request: `uve help request

Purpose:
  Send a risk-evaluation request to the Utanvet-Ellenor API.

Endpoint:
  POST /api/v2/request

Minimum payload:
  email
  threshold

Extended identity fields:
  phoneNumber
  countryCode
  postalCode
  addressLine

Rule for extended identity:
  If you provide any of phoneNumber, countryCode, postalCode, or addressLine,
  all four must be present.

Supported request fields:
  email         string, required, valid email
  threshold     number, required, range 0..1
  phoneNumber   string, optional, E.164 format, ex: +36301234567
  countryCode   string, optional, 2-letter ISO code, ex: HU
  postalCode    string, optional
  addressLine   string, optional
  orderId       string, optional
  amount        number, optional, non-negative
  currency      string, optional, 3-letter ISO code, ex: HUF
  ipAddress     string, optional, IPv4 or IPv6
  userAgent     string, optional
  metadata      object, optional

Input methods:
  --data-file ./payload.json
  --stdin
  inline flags

Input merge order:
  data-file < stdin < inline flags

Examples:
  uve request --email customer@example.com --threshold 0.8

  uve request \\
    --email customer@example.com \\
    --threshold 0.8 \\
    --phone-number +36301234567 \\
    --country-code HU \\
    --postal-code 1117 \\
    --address-line "Example utca 1." \\
    --order-id ORDER-10001 \\
    --amount 19990 \\
    --currency HUF

  uve request --data-file ./examples/request.json --sandbox

  cat ./examples/request.json | uve request --stdin --dry-run

Good practice:
  - Start with --dry-run
  - Prefer sandbox for first integration
  - Keep threshold explicit rather than hiding it in templates
  - Send the richest identity data you reliably have
  - Observed UNAS production request accepts: email, threshold, orderId, phoneNumber, countryCode, postalCode, addressLine
  - Observed UNAS production request rejects: amount, currency, ipAddress, userAgent, metadata
`,

  signal: `uve help signal

Purpose:
  Send the later outcome of an order back to the Utanvet-Ellenor API.

Endpoint:
  POST /api/v2/signal

Minimum payload:
  email
  orderId
  outcome

Outcome values:
  1   successful / acceptable order outcome
  -1  problematic / negative order outcome

Supported signal fields:
  email         string, required, valid email
  orderId       string, required
  outcome       number, required, must be 1 or -1
  phoneNumber   string, optional, E.164 format
  countryCode   string, optional, 2-letter ISO code
  postalCode    string, optional
  addressLine   string, optional
  amount        number, optional, non-negative
  currency      string, optional, 3-letter ISO code
  metadata      object, optional

Rule for extended identity:
  If you provide any of phoneNumber, countryCode, postalCode, or addressLine,
  all four must be present.

Examples:
  uve signal --email customer@example.com --order-id ORDER-10001 --outcome -1

  uve signal --data-file ./examples/signal.json

  cat ./examples/signal.json | uve signal --stdin --sandbox

When to use signal:
  - After successful delivery or successful order completion, use outcome=1
  - After failed fulfillment, fraud, return-to-sender, or similar bad outcome, use outcome=-1

Why signal matters:
  The API uses feedback history. If you only request and never signal outcomes,
  you lose part of the value of the integration.

Observed UNAS production signal:
  - accepts: email, orderId, outcome, phoneNumber, countryCode, postalCode, addressLine
  - rejects: amount, currency, metadata
`,

  config: `uve help config

Credential sources, highest priority first:
  1. --public-key / --private-key flags
  2. UVE_PUBLIC_KEY / UVE_PRIVATE_KEY environment variables
  3. local config file

Environment variables:
  UVE_PUBLIC_KEY
  UVE_PRIVATE_KEY
  UVE_SANDBOX
  UVE_TIMEOUT_MS

Config commands:
  uve config init --public-key KEY --private-key KEY [--sandbox]
  uve config set publicKey KEY
  uve config set privateKey KEY
  uve config set sandbox true
  uve config set timeoutMs 15000
  uve config show
  uve config show --json --reveal-secrets
  uve config path

Config file location:
  - uses --config PATH if provided
  - otherwise uses $XDG_CONFIG_HOME/utanvetellenor-cli/config.json
  - fallback is ~/.config/utanvetellenor-cli/config.json

Examples:
  uve config init --public-key pk_test --private-key sk_test --sandbox
  uve config set timeoutMs 20000
  uve doctor

Operational note:
  For automation, prefer environment variables.
  For interactive local usage, config init is simpler.
`,

  responses: `uve help responses

This CLI exposes two classes of status:

1. HTTP transport status
  Example: HTTP 200 OK, HTTP 401 Unauthorized, HTTP 429 Too Many Requests

2. API status inside the JSON response body
  0  Success
  1  Missing required parameter
  2  Missing authentication credentials
  3  Invalid authentication credentials
  4  Merchant not authorized
  5  Too many requests
  6  Invalid request body
  7  Temporarily unavailable

Helpers:
  uve status-codes
  uve reasons

Mapped reason identifiers:
  1  neutral
  2  good_history
  3  bad_history
  4  high_risk
  5  manual_review
  6  email_risk
  7  address_risk
  8  phone_risk

CLI exit behavior:
  - exit code 0 for successful transport and API status 0
  - exit code 1 when HTTP fails or API status is non-zero

Practical reading strategy:
  - check HTTP status first
  - then check API status
  - for request responses, inspect result, blocked, reputation, and reason_id
  - for signal responses, treat non-zero API status as failed feedback submission
  - observed production success can use body.status 200
  - observed request "No Signals were found." can use body.status 404 without being a hard failure
`,

  ai: `uve help ai

AI handoff guide:

What this tool is:
  A local Node CLI at ./src/cli.js
  for the Utanvet-Ellenor API. It wraps the documented request and signal
  endpoints and adds local validation, config handling, templates, and readable output.

What an AI should know before using it:
  - It is not a generic REST wrapper.
  - It only supports the two documented API operations: request and signal.
  - It expects HTTP Basic auth using publicKey:privateKey.
  - It can run with either local config or environment variables.
  - Dry-runs do not require credentials.

Minimal workflow for another AI:
  1. Inspect config:
     uve doctor
     uve config show
  2. If credentials are missing, set them:
     uve config init --public-key ... --private-key ... --sandbox
     or export UVE_PUBLIC_KEY / UVE_PRIVATE_KEY
  3. Generate a template if needed:
     uve template request
     uve template signal
  4. Validate before sending:
     uve request --data-file ./examples/request.json --dry-run
     uve signal --data-file ./examples/signal.json --dry-run
  5. Send against sandbox first:
     uve request --data-file ./examples/request.json --sandbox
  6. After real-world outcome is known, send:
     uve signal --data-file ./examples/signal.json --sandbox

Payload construction rules:
  Request:
    required: email, threshold
  Signal:
    required: email, orderId, outcome
  Extended identity:
    phoneNumber, countryCode, postalCode, addressLine are coupled
    if one is present, all four are required
  Types:
    threshold must be 0..1
    outcome must be 1 or -1
    amount must be non-negative
    currency should be 3-letter ISO
    phoneNumber should be E.164

How input precedence works:
  --data-file is loaded first
  --stdin is merged over it
  inline flags override both

Important commands for automation:
  uve request --json ...
  uve signal --json ...
  uve doctor --json
  uve reasons --json
  uve status-codes --json

How to interpret failures:
  - If HTTP fails, it may be network, auth, endpoint, or service availability.
  - If API status is non-zero, the request reached the service but was rejected.
  - Exit code 1 means the command should be treated as failed in scripts.

Recommended safe operating pattern:
  - Use sandbox first
  - Use --dry-run before live sends
  - Store credentials in env vars for CI/automation
  - Do not guess field names; use camelCase JSON keys or documented CLI flags
  - Use template output and modify it rather than inventing payloads from memory

Useful files:
  ./README.md
  ./examples/request.json
  ./examples/signal.json

If another AI needs a single starting point:
  Run: uve help ai
`,
};

export function getHelpText(topic = "overview") {
  const normalizedTopic = (topic || "overview").toLowerCase();
  return TOPIC_HELP[normalizedTopic] || `Unknown help topic: ${topic}

Available topics:
  overview
  request
  signal
  config
  responses
  ai
`;
}
