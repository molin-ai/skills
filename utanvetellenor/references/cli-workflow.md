# CLI Workflow

## Purpose

Use this reference to operate the bundled Utanvet-Ellenor CLI correctly.

CLI entrypoint:

```bash
node ./src/cli.js
```

## Setup

Inspect current state:

```bash
node ./src/cli.js doctor
node ./src/cli.js config show
```

Configure credentials:

```bash
node ./src/cli.js config init --public-key YOUR_PUBLIC_KEY --private-key YOUR_PRIVATE_KEY --sandbox
```

Credential precedence:

1. CLI flags
2. Environment variables
3. Local config file

Supported environment variables:

- `UVE_PUBLIC_KEY`
- `UVE_PRIVATE_KEY`
- `UVE_SANDBOX`
- `UVE_TIMEOUT_MS`

## Request

Use `request` before allowing risky downstream actions.

Minimum required fields:

- `email`
- `threshold`

Optional fields:

- `phoneNumber`
- `countryCode`
- `postalCode`
- `addressLine`
- `orderId`
- `amount`
- `currency`
- `ipAddress`
- `userAgent`
- `metadata`

Observed UNAS production request support:

- accepts: `email`, `threshold`, `orderId`, `phoneNumber`, `countryCode`, `postalCode`, `addressLine`
- rejects: `amount`, `currency`, `ipAddress`, `userAgent`, `metadata`

Important coupling rule:

- if one of `phoneNumber`, `countryCode`, `postalCode`, or `addressLine` is present, all four should be present

Validation rules:

- `threshold` must be between `0` and `1`
- `amount` must be non-negative
- `currency` should be a 3-letter ISO code
- `phoneNumber` should be E.164

Examples:

```bash
node ./src/cli.js request --email customer@example.com --threshold 0.8

node ./src/cli.js request \
  --email customer@example.com \
  --threshold 0.8 \
  --phone-number +36301234567 \
  --country-code HU \
  --postal-code 1117 \
  --address-line "Example utca 1." \
  --order-id ORDER-10001
```

Use JSON or file-based input when needed:

```bash
node ./src/cli.js request --data-file ./examples/request.json --dry-run
cat ./examples/request.json | node ./src/cli.js request --stdin --dry-run
node ./src/cli.js request --json --data-file ./examples/request.json
```

## Signal

Use `signal` after the real order outcome becomes known.

Minimum required fields:

- `email`
- `orderId`
- `outcome`

Allowed outcomes:

- `1` for successful / acceptable outcome
- `-1` for failed / problematic / abusive outcome

Observed UNAS production signal support:

- accepts: `email`, `orderId`, `outcome`, `phoneNumber`, `countryCode`, `postalCode`, `addressLine`
- rejects: `amount`, `currency`, `metadata`

Examples:

```bash
node ./src/cli.js signal --email customer@example.com --order-id ORDER-10001 --outcome -1
node ./src/cli.js signal --data-file ./examples/signal.json --dry-run
node ./src/cli.js signal --json --data-file ./examples/signal.json
```

## Input Merge Order

The CLI merges payload sources in this order:

1. `--data-file`
2. `--stdin`
3. inline flags

Inline flags win.

## Safe Operating Pattern

1. Run `doctor`
2. Use templates or examples if payload shape is unclear
3. Use `--dry-run`
4. Send the live request
5. Treat non-zero exit code as failure

Helpful commands:

```bash
node ./src/cli.js help
node ./src/cli.js help ai
node ./src/cli.js template request
node ./src/cli.js template signal
node ./src/cli.js reasons --json
node ./src/cli.js status-codes --json
```

## Response Handling

Check:

1. HTTP status
2. API status
3. request fields such as `result`, `blocked`, `reputation`, and `reason_id`

Treat these conservatively:

- request failure
- non-zero API status
- blocking result
- high-risk or unclear result

Do not silently continue risky downstream automation after an unclear or failed response.

Observed live behavior:

- successful request used `body.status: 200`
- successful signal used `body.status: 200`
- request with no prior history used `body.status: 404` and `reason: "No Signals were found."`
- sandbox with the tested keys returned `No Origin found with the credentials provided.`
