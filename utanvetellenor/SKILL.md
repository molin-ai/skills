---
name: utanvetellenor
description: Use the bundled Utanvet-Ellenor CLI to decide when to run a UVE risk check and to send later outcome signals. Trigger when an agent is about to create or approve a new customer, first invoice, COD order, shipment, fulfillment, or other downstream customer-linked record for a new, unknown, or suspicious customer; when an agent needs to dry-run or send a UVE request/signal; or when an agent needs to configure credentials and interpret UVE responses conservatively.
---

# Utanvet-Ellenor CLI

## Overview

Use the local CLI in this folder to call Utanvet-Ellenor before risky downstream actions and to send outcome feedback later.

Work from the skill root:

```bash
cd <skill-folder>
```

Use the CLI entrypoint:

```bash
node ./src/cli.js
```

## Quick Start

Inspect the local setup first:

```bash
node ./src/cli.js doctor
node ./src/cli.js help ai
```

Configure credentials if needed:

```bash
node ./src/cli.js config init --public-key YOUR_PUBLIC_KEY --private-key YOUR_PRIVATE_KEY --sandbox
```

Validate a payload before sending it:

```bash
node ./src/cli.js request --data-file ./examples/request.json --dry-run
node ./src/cli.js signal --data-file ./examples/signal.json --dry-run
```

Send live requests only after the dry-run looks correct.

For the tested UNAS production account, use the short request/signal shapes documented in the references.

## Workflow Decision

Run `request` before allowing downstream creation when the next step would create or approve:

- a new customer
- a first invoice
- a shipment or fulfillment
- a COD or postpay order
- another durable customer-linked downstream record

Bias toward calling UVE when the customer is:

- new
- weakly known
- high-value
- suspicious
- using new email, phone, or address data

Run `signal` later when the real order outcome becomes known.

## Command Pattern

Use `request` for pre-decision checks:

```bash
node ./src/cli.js request --email customer@example.com --threshold 0.8
```

Use `signal` for later feedback:

```bash
node ./src/cli.js signal --email customer@example.com --order-id ORDER-10001 --outcome -1
```

Use `--json` when another agent or workflow needs machine-readable output.

## References

Read [references/invocation-policy.md](references/invocation-policy.md) to decide when to call UVE.

Read [references/cli-workflow.md](references/cli-workflow.md) for exact commands, payload rules, and response handling.
