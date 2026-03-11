---
name: barion
description: Use the bundled Barion CLI to operate ecommerce payment flows. Trigger when an agent needs to start a Barion checkout, fetch payment state after callback or redirect return, complete prepared and 3DS-authenticated token-payment flows, finish reservations, capture or cancel authorizations, refund payments, configure a POS key, or decide where Barion should gate checkout, fulfillment, refund, and reconciliation workflows.
---

# Barion CLI

## Overview

Use the local CLI in this folder for Barion ecommerce payment flows.

Work from the skill root:

```bash
cd <skill-folder>
node ./src/cli.js
```

## Quick Start

Inspect setup:

```bash
node ./src/cli.js doctor
node ./src/cli.js help ai
```

Configure the POS key:

```bash
node ./src/cli.js config init --pos-key YOUR_POS_KEY --sandbox
```

Dry-run a checkout start request:

```bash
node ./src/cli.js start --dry-run --data-file ./examples/start.json
```

## Workflow Decision

Use `start` when checkout is ready to create a Barion payment session.

Use `state` after callback return, redirect return, retry jobs, or support checks.

Use `finish-reservation`, `capture`, `cancel-authorization`, and `refund` as post-start lifecycle operations.

Use `complete` only for prepared and 3DS-authenticated token-payment flows that require it.

Do not rely only on redirect return pages. Reconcile with callback plus state checks.

## References

Read [references/ecommerce-workflows.md](references/ecommerce-workflows.md) for ecommerce timing and lifecycle use.

Read [references/cli-workflow.md](references/cli-workflow.md) for exact command patterns and input rules.

Read [references/barion-notes.md](references/barion-notes.md) for researched endpoint and environment notes.
