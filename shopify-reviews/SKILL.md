---
name: shopify-reviews
description: Use when an agent needs to inspect Shopify product reviews, review counts, average ratings, or review-app data stored in Shopify. Trigger for review exports, review troubleshooting, review-summary checks, or app-specific review discovery via Shopify Admin GraphQL and metafields. Judge.me is a known supported path, but other Shopify review apps may use similar metafield patterns and should be discovered first.
---

# Shopify Reviews

## Overview

Use Shopify Admin GraphQL via `n shopify graphql` to inspect review data on a Shopify store.

Start with discovery because review apps vary. Many Shopify review apps store:

- shop-level metafields for review summary or cached review JSON
- product-level metafields for badges, widgets, or app-specific metadata

Do not assume every app exposes raw review bodies through Shopify metafields. Verify the namespace and keys first.

## Discovery Workflow

Check shop-level metafields first:

```bash
n shopify graphql '{ shop { metafields(first: 100) { edges { node { namespace key type } } } } }' --store <store>.myshopify.com
```

If needed, inspect a few products for app-specific metafields:

```bash
n shopify graphql '{ products(first: 5) { edges { node { title metafields(first: 50) { edges { node { namespace key type } } } } } } }' --store <store>.myshopify.com
```

Heuristics:

- look for namespaces matching the review app name
- look for keys containing `review`, `reviews`, `rating`, `badge`, `summary`, or `widget`
- prefer shop-level JSON summaries first
- treat product-level HTML/widget fields as presentation data unless proven otherwise

## Judge.me Reviews via Shopify Metafields

Judge.me writes a review summary to shop-level metafields under namespace `judgeme`.

Known key:

- `reviews_grid`

No Judge.me API key is required for this path. Molin's Shopify CLI access is enough.

## Fetch Judge.me Reviews

```bash
n shopify graphql '{ shop { metafields(first: 50, namespace: "judgeme") { edges { node { key value } } } } }' --store <store>.myshopify.com
```

Parse the `reviews_grid` key. It contains a JSON blob with:

- `number_of_reviews`
- `average_rating`
- `all_reviews.reviews[]`

Each review may include:

- `reviewer_name`
- `rating`
- `body`
- `product_title`
- `created_at`
- `verified_buyer`

## Parse Judge.me Cleanly

```bash
n shopify graphql '{ shop { metafields(first: 50, namespace: "judgeme") { edges { node { key value } } } } }' --store <store>.myshopify.com | python3 -c "
import sys, json
data = json.load(sys.stdin)
for mf in data['data']['shop']['metafields']['edges']:
    if mf['node']['key'] == 'reviews_grid':
        parsed = json.loads(mf['node']['value'])
        print(f'Reviews: {parsed[\"number_of_reviews\"]} | Avg: {parsed[\"average_rating\"]}')
        for r in parsed['all_reviews']['reviews']:
            print(f'{r[\"reviewer_name\"]} - {r[\"rating\"]}/5 - {r[\"product_title\"]}')
            print(f'  {r[\"body\"]}')
"
```

## Interpretation Notes

- `reviews_grid` is a shop-level summary blob
- large stores may also have `reviews_grid_1`, `reviews_grid_2`, and similar continuation keys
- product-level `judgeme` metafields usually contain badge or widget HTML, not raw review data
- for full review access such as filtering, pagination, moderation, or replies, the app's own API may still be required

## Operating Guidance

When working with a Shopify store that uses an unknown review app:

1. discover namespaces and keys first
2. verify whether the data is JSON, HTML, or just a widget placeholder
3. prefer shop-level review-summary JSON if present
4. only claim raw review extraction is possible after confirming the field contents

For Judge.me, use the `judgeme` namespace and `reviews_grid` path first before considering any separate API integration.
