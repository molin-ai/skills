# utanvetellenor

Dependency-light Node CLI for the Utanvet-Ellenor API. It supports the two documented API operations:

- `request`: ask the API whether a customer/order should be blocked
- `signal`: send a later delivery outcome back to the service

It uses:

- Basic auth with `publicKey:privateKey`
- production host: `https://www.utanvet-ellenor.hu`
- sandbox host: `https://sandbox.utanvet-ellenor.hu`

## Requirements

- Node 24+

## Setup

```bash
cd <skill-folder>
node ./src/cli.js version
node ./src/cli.js config init --public-key YOUR_PUBLIC_KEY --private-key YOUR_PRIVATE_KEY
```

Credentials can also come from environment variables:

```bash
export UVE_PUBLIC_KEY=...
export UVE_PRIVATE_KEY=...
export UVE_SANDBOX=true
export UVE_TIMEOUT_MS=10000
```

## Commands

### Request

Minimum documented payload:

```bash
node ./src/cli.js request \
  --email customer@example.com \
  --threshold 0.8
```

Extended identity payload:

```bash
node ./src/cli.js request \
  --email customer@example.com \
  --threshold 0.8 \
  --phone-number +36301234567 \
  --country-code HU \
  --postal-code 1117 \
  --address-line "Example utca 1." \
  --order-id ORDER-10001
```

Load the request body from JSON:

```bash
node ./src/cli.js request --data-file ./examples/request.json --sandbox
cat ./examples/request.json | node ./src/cli.js request --stdin --sandbox
```

### Signal

Minimum documented payload:

```bash
node ./src/cli.js signal \
  --email customer@example.com \
  --order-id ORDER-10001 \
  --outcome -1
```

Load the signal body from JSON:

```bash
node ./src/cli.js signal --data-file ./examples/signal.json
```

### Config

```bash
node ./src/cli.js config path
node ./src/cli.js config show
node ./src/cli.js config set sandbox true
node ./src/cli.js config set timeoutMs 15000
```

### Reference helpers

```bash
node ./src/cli.js reasons
node ./src/cli.js status-codes
node ./src/cli.js template request
node ./src/cli.js template signal
node ./src/cli.js doctor
node ./src/cli.js help ai
```

### Help topics

The built-in help is now split into operator-focused topics:

```bash
node ./src/cli.js help
node ./src/cli.js help request
node ./src/cli.js help signal
node ./src/cli.js help config
node ./src/cli.js help responses
node ./src/cli.js help ai
```

`help ai` is intended as the handoff entrypoint for another AI. It includes:

- the exact purpose and scope of the CLI
- credential and environment rules
- payload construction rules
- safe workflow order
- failure interpretation
- the most relevant files and commands

## Install locally

If you want a shell command instead of `node ./src/cli.js`, from the project directory run:

```bash
npm link
uve help
```

## Notes

- `request` requires `email` and `threshold`.
- `signal` requires `email`, `orderId`, and `outcome`.
- `outcome` must be `1` or `-1`.
- If you use any extended identity field (`phoneNumber`, `countryCode`, `postalCode`, `addressLine`), all four are required.
- `threshold` is validated as `0..1`.
- Use `--dry-run` to validate and inspect the payload without sending it.
- Observed UNAS production `request` accepts: `email`, `threshold`, `orderId`, `phoneNumber`, `countryCode`, `postalCode`, `addressLine`.
- Observed UNAS production `request` rejects: `amount`, `currency`, `ipAddress`, `userAgent`, `metadata`.
- Observed UNAS production `signal` accepts: `email`, `orderId`, `outcome`, `phoneNumber`, `countryCode`, `postalCode`, `addressLine`.
- Observed UNAS production `signal` rejects: `amount`, `currency`, `metadata`.
- Observed sandbox with the tested keys returned `No Origin found with the credentials provided.`
