# barion

Uploadable Barion skill package plus local Node CLI.

Use it for:

- payment start
- payment state lookup
- prepared/3DS token-payment completion
- reservation/capture flows
- cancel authorization
- refunds

## Setup

```bash
cd <skill-folder>
node ./src/cli.js config init --pos-key YOUR_POS_KEY --sandbox
node ./src/cli.js help
```

## Examples

```bash
node ./src/cli.js start --dry-run --data-file ./examples/start.json
node ./src/cli.js state --dry-run --payment-id 11111111111111118111111111111111
node ./src/cli.js refund --dry-run --data-file ./examples/refund.json
```

## Notes

- prefer JSON files for complex request bodies
- use `--set path=value` for small overrides
- reconcile payment state with callback plus `state`
- `state` uses the v4 `/payment/{PaymentId}/paymentstate` route
- `complete` is for prepared and 3DS-authenticated token payment style flows, not general redirect handling
- the uploadable skill entrypoint is `SKILL.md`
