# Invocation Policy

## Purpose

Use this reference to decide when another agent should invoke Utanvet-Ellenor.

## Core Rule

If the customer is new, unknown, suspicious, or weakly verified, invoke Utanvet-Ellenor before allowing irreversible or costly downstream actions.

## Strong Trigger Conditions

Invoke UVE before continuing when any of these are true:

- the customer is new
- the customer has no prior successful order history
- the email is new
- the phone number is new
- the address is new
- the order is high-value
- the order uses COD, postpay, or another higher-risk payment pattern
- the workflow is about to create a first invoice
- the workflow is about to create a shipment or fulfillment
- the workflow is about to create a durable customer-linked record
- the customer was previously suspicious or problematic

## Best Timing

Prefer invoking `request` before:

1. creating a new customer
2. approving a first order
3. creating the first invoice
4. creating shipment or fulfillment
5. enabling COD or postpay

Prefer invoking `signal` after:

1. successful delivery or clean order completion
2. failed fulfillment
3. abusive or fraudulent outcome
4. return-to-sender or other materially bad outcome

## Conservative Gating Rule

If UVE fails, returns a non-zero API status, or produces a risky or unclear result, stop automatic progression and require review.

Do not let the external workflow continue just because the next business step is convenient.

## Simple Decision Pattern

Ask:

1. Is this a new or weakly-known customer?
2. Is the workflow about to create a downstream record?
3. Would the next step cost money, stock, logistics effort, or trust if wrong?

If yes to any of these, bias toward invoking UVE.

## Default Policy Text

Use this short rule:

> Before allowing a workflow to create a new customer, first invoice, shipment, or other downstream customer-linked record for a new or weakly-known customer, call Utanvet-Ellenor first. If the response is risky, unclear, or failed, stop automatic progression and require review.

## Tested UNAS Note

For the tested UNAS production account, keep request/signal payloads short and use the identity group plus `orderId` when available. Do not send `amount`, `currency`, or request metadata-style extras unless the integration is confirmed to support them.
