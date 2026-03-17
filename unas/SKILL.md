---
name: unas
description: UNAS CLI integration via `n unas` commands. Use when working with the UNAS e-commerce platform, running `n unas` commands, setting up UNAS authentication. Also use when the user mentions UNAS shop management, product/order/customer/stock queries via the n-cli, or needs to connect to a UNAS store.
---

# UNAS CLI

Use `n unas` to manage UNAS shops via the XML API.

All requests are POST to `https://api.unas.eu/shop/<endpoint>` with XML bodies. API keys are 40-character strings.

Official UNAS API docs: unas.hu/tudastar/api

Run any command with `--help` to discover its parameters and usage.

## Auth

```sh
n unas auth login          # auto-detect shops linked to your Molin account
n unas auth login <apiKey> # log in with a specific API key
n unas auth status         # show active shop, masked key, token validity, plan, permissions
n unas auth logout         # delete local credential cache
n unas whoami              # active shop and hostname
```

### Env var override (scripts/CI)

Skip the login flow by setting env vars directly:

```sh
export UNAS_API_KEY="your-40-char-api-key"
```

## Resource commands

### Products (`n unas products`)

| Operation | Description             |
| --------- | ----------------------- |
| `list`    | Paginated product list  |
| `get`     | Fetch by UNAS ID or SKU |

```sh
n unas products list --limit 50 --offset 0 --state live
n unas products list --sku ABC123 --content-type full --xml
n unas products list --category-id 10 --status-base 1 --from 2025.01.01
n unas products get --id 12345
n unas products get --sku ABC123 --content-type full
n unas products get --parent PARENT-SKU   # list variants
```

Options: `--limit`, `--offset`, `--state live|deleted`, `--sku`, `--category-id`, `--content-type minimal|short|normal|full`, `--content-param`, `--status-base 0|1|2|3`, `--from`, `--to`, `--lang`, `--xml`

**Creating and modifying products (`n unas products set`):**

```sh
# add a new product
n unas products set --sku MY-SKU --name "Product Name" --unit db --price-gross 9990 --price-net 7874 --vat "27%" --category-id 100001

# modify with image URLs (UNAS fetches async)
n unas products set --sku MY-SKU --action modify --image-url https://example.com/img.jpg --image-url https://example.com/img2.jpg

# modify with local image files (base64-encoded inline — use when URL is not publicly accessible)
n unas products set --sku MY-SKU --action modify --image-file ./photo.jpg --image-file ./photo2.jpg

# pass a raw XML file directly (bypasses all flags)
n unas products set --xml-file product.xml --xml
```

**Image gotchas:**

- PNG support via `--image-url` is unconfirmed — UNAS may silently fail for non-JPEG URLs
- `<Content>` tag does NOT work for images — returns `"No modifiable data"` silently
- `alt` images require `<Id>` between 1 and 9
- Image processing is asynchronous — allow a few seconds after the call before checking
- Always run `n unas cache clear` after uploading images

**Converting PNG to JPEG**

```python
# uv run --with Pillow python3 convert.py
from PIL import Image
import io, base64

def encode_for_unas(path):
    img = Image.open(path).convert('RGB')
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90)
    return base64.b64encode(buf.getvalue()).decode()
```

### Orders (`n unas orders`)

| Operation | Description                                        |
| --------- | -------------------------------------------------- |
| `list`    | Paginated order list with filters                  |
| `get`     | Fetch by human-readable order key (e.g. 1000-1000) |
| `update`  | Update status, tracking, invoicing, comments       |

```sh
n unas orders list --limit 10 --status open_normal
n unas orders list --email customer@example.com --from 2025.01.01
n unas orders get 1000-1000000
n unas orders update 1000-1000000 --status shipped --tracking-url https://track.example.com/123
n unas orders update 1000-1000000 --invoice-status 2 --invoice-number INV-001
```

List options: `--limit`, `--offset`, `--email`, `--status`, `--status-name`, `--status-id`, `--invoice-status 0|1|2`, `--auto-mark-invoiced`, `--from`, `--to`, `--mod-from`, `--mod-to`, `--lang base|customer`, `--xml`

Update options: `--status`, `--status-email yes|no`, `--seen`, `--tracking-url`, `--package-number`, `--shipping-name`, `--shipping-zip`, `--shipping-city`, `--shipping-street`, `--shipping-country`, `--shipping-county`, `--billing-name`, `--billing-zip`, `--billing-city`, `--billing-street`, `--billing-country`, `--billing-county`, `--billing-company`, `--billing-vat-number`, `--invoice-status`, `--invoice-number`, `--invoice-url`, `--storno-number`, `--storno-url`, `--payment-amount`, `--payment-date`, `--comment`, `--comment-customer`, `--comment-shipping`, `--xml`

#### Order items (`n unas orders items`)

Safe subcommands for modifying individual line items without risk of accidentally deleting other items. Each command uses a fetch-modify-replace pattern internally: fetches the current items, applies the change, and sends the complete list back.

**WARNING:** The UNAS `setOrder` API uses **full replacement** semantics for `<Items>` — sending items replaces ALL items in the order. These subcommands handle this safely. NEVER use raw `n unas request /setOrder` with `<Items>` unless you are sending the complete item list.

| Operation | Description                         |
| --------- | ----------------------------------- |
| `list`    | List current line items of an order |
| `add`     | Add a product by SKU                |
| `remove`  | Remove an item by SKU               |
| `set-qty` | Change quantity of an item by SKU   |

```sh
n unas orders items list 1000-1000000
n unas orders items list 1000-1000000 --xml
n unas orders items add 1000-1000000 --sku ABC123
n unas orders items add 1000-1000000 --sku ABC123 --quantity 3
n unas orders items remove 1000-1000000 --sku ABC123
n unas orders items set-qty 1000-1000000 --sku ABC123 --quantity 5
```

- `add` auto-resolves product name, unit, price, and VAT from the catalog via `/getProduct`
- `add` errors if the SKU already exists in the order (use `set-qty` instead)
- `remove` errors if removing would leave 0 items (UNAS requires at least 1 item)
- `set-qty` errors if quantity is 0 (use `remove` to delete an item)
- All commands show a color-coded diff summary before sending the update

### Customers (`n unas customers`)

| Operation | Description                                |
| --------- | ------------------------------------------ |
| `list`    | Paginated customer list with filters       |
| `get`     | Fetch by email                             |
| `check`   | Validate customer credentials (login test) |

```sh
n unas customers list --limit 100 --email user@example.com
n unas customers list --reg-from 2025.01.01 --mod-to 2025.06.01
n unas customers get user@example.com
n unas customers check myuser mypassword
```

Options: `--limit`, `--offset`, `--id`, `--email`, `--username`, `--reg-from`, `--reg-to`, `--mod-from`, `--mod-to`, `--login-from`, `--login-to`, `--xml`

### Stock (`n unas stock`)

| Operation | Description                         |
| --------- | ----------------------------------- |
| `list`    | List stock/inventory levels         |
| `update`  | Update stock quantity for a product |

```sh
n unas stock list --sku ABC123
n unas stock list --modified-after 2025-01-01T00:00:00
n unas stock update --sku ABC123 --qty 50 --action in
n unas stock update --id 12345 --qty 10 --action out --warehouse-id 2 --comment "sold at event"
```

List options: `--id`, `--sku`, `--variant1/2/3`, `--limit`, `--offset`, `--modified-after`, `--xml`

Update options: `--id` or `--sku` (required), `--qty` (required), `--action in|out|modify`, `--warehouse-id`, `--variant1/2/3`, `--price`, `--comment`, `--xml`

### Scripts (`n unas scripts`)

| Operation | Description            |
| --------- | ---------------------- |
| `list`    | List all script tags   |
| `add`     | Add new script tag     |
| `modify`  | Modify existing script |
| `delete`  | Delete a script tag    |

```sh
n unas scripts list
n unas scripts list --id 123
n unas scripts add --title "My Widget" --src https://cdn.example.com/widget.js --type head --load-type async
n unas scripts add --title "Inline" --content-file ./snippet.html --type body_end --allow-always
n unas scripts delete 123
```

Add options: `--title` (required), `--src` or `--content` or `--content-file` (one required), `--type head|body_start|body_end`, `--load-type normal|async|defer`, `--status active|inactive`, `--allow-always`, `--pages`, `--page-filter-type allow|deny`, `--languages`, `--xml`

**Script tags gotchas:**

- **UNAS wraps inline content in `<script>` tags**: Inline content (`--content` / `--content-file`) is automatically wrapped in `<script>` tags by UNAS, so it MUST be valid JavaScript (never raw HTML). To inject HTML (banners, widgets), write JS that creates DOM elements:

  ```js
  document.addEventListener("DOMContentLoaded", function () {
    var el = document.createElement("div");
    el.innerHTML = "...";
    var target = document.getElementById("ud_shop_start");
    if (target) target.insertBefore(el, target.firstChild);
  });
  ```

- **AllowAlways requires a two-step workaround**: `--allow-always` on `scripts add` is silently ignored by the UNAS API. The CLI automatically handles this limitation by performing a two-step create-then-modify operation. If you need to do it manually:

  ```sh
  n unas scripts add --title "My Script" --content-file ./script.js --type head --xml
  # note the returned Id
  n unas scripts modify <id> --allow-always --xml
  ```

  **Cookie consent gating:**
  - By default, script tags are gated behind the shop's cookie consent banner
  - If `AllowAlways` is `no` (or not set), the script won't execute until the visitor accepts cookies
  - For essential UI elements (banners, navigation, layout), `AllowAlways` must be `yes` to ensure they load immediately

- **CDN caching — MUST clear after every script change**: UNAS uses aggressive server-side CDN caching. After adding, modifying, or deleting script tags, changes will NOT appear on the live site until you purge the cache. Without a manual purge, stale content can persist for hours or indefinitely. Always run this after any script tag change:

  ```sh
  n unas cache clear
  ```

  This is the API equivalent of clearing the cache from the UNAS admin panel (Beállítások → Gyorsítótár).

- `scripts delete` takes a positional arg, not `--id`: use `n unas scripts delete 123` (not `--id 123`)

### Coupons (`n unas coupons`)

| Operation | Description                 |
| --------- | --------------------------- |
| `list`    | List coupon codes           |
| `add`     | Create a new coupon         |
| `modify`  | Modify an existing coupon   |
| `delete`  | Delete a coupon by its code |

```sh
n unas coupons list [--id CODE] [--limit N] [--xml]
n unas coupons add --id CODE10 --type percent --value 10 --base-type total
n unas coupons modify CODE10 --value 15 [options]
n unas coupons delete CODE10
```

Add options: `--id` (required, coupon code), `--type percent|fix` (required), `--value` (required), `--base-type total|product|shipping|giftcard`, `--max-usability-in-orders N`, `--max-usability-per-customer N`, `--usability-for-new-customers everyone|only_new|only_existing`, `--disable-for-sale-products yes|no`, `--date-start YYYY.MM.DD`, `--date-end YYYY.MM.DD`, `--min-order-value`, `--allowed-for-subscriber none|subscribed|registered_and_subscribed`, `--xml`

**Coupon gotchas:**

- The coupon code (`--id`) serves as both the unique identifier and the code customers enter at checkout
- Coupon codes are case-sensitive

### Cache (`n unas cache`)

| Operation | Description     |
| --------- | --------------- |
| `clear`   | Clear CDN cache |

```sh
n unas cache clear
```

**CDN caching gotchas:**

- UNAS uses aggressive server-side CDN caching for performance
- After modifying script tags, pages, or content, changes will NOT appear on the live site until you clear the cache manually
- The `cache clear` command is equivalent to clearing cache from the UNAS admin panel (Beállítások → Gyorsítótár)
- The `scripts add`, `scripts modify`, and `scripts delete` commands automatically remind you to clear the cache after successful operations

## Standalone resource commands

| Command              | Description                        | Key options                                                         |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `order-statuses`     | List available order statuses      | `--id`, `--type open_normal\|close_ok\|close_fault\|open_prepare`   |
| `order-types`        | List order types                   | `--id`                                                              |
| `methods`            | List payment and shipping methods  | `--id`, `--type payment\|shipping`                                  |
| `categories`         | List product categories            | `--limit`, `--offset`, `--id`, `--name`, `--parent`, `--history`    |
| `product-parameters` | List product parameter definitions | `--id`, `--type`, `--lang`                                          |
| `warehouses`         | List additional warehouses         | `--id`, `--name`                                                    |
| `customer-groups`    | List customer groups               | `--id`, `--name`                                                    |
| `delivery-points`    | List delivery/pickup locations     | `--group` (required), `--id`                                        |
| `package-offers`     | List product bundle offers         | `--id`, `--active yes\|no`, `--name`, `--lang`                      |
| `automatisms`        | List automated workflow processes  | `--id`, `--active`, `--schedule`, `--operation`, `--event`          |
| `page-content`       | List content elements for pages    | `--id`, `--type`, `--page-id`, `--limit`, `--offset`, `--lang`      |
| `pages`              | List plus pages and menu items     | `--id`, `--lang`, `--parent`, `--content-id`, `--limit`, `--offset` |
| `reviews`            | List product reviews               | `--sku`, `--id`, `--confirmed`, `--from`, `--to`, `--lang`          |
| `newsletter`         | List newsletter subscribers        | `--email`, `--type subscriber\|customer`, `--confirmed`, `--from`   |
| `storage`            | List files/folders in file manager | `--type all\|file\|folder`, `--get-info`, `--folder`                |
| `settings`           | Read shop settings                 | `--key`, `--country`, `--lang`                                      |
| `product-db`         | Export products in bulk DB format  | `--format csv2\|csv\|xls\|xlsx\|txt`, `--output`, `--columns`       |

All standalone commands support `--xml`.

## Critical rules for working with the UNAS API

### ALWAYS read the official docs FIRST

Before guessing XML structures or experimenting with API calls, go to **unas.hu/tudastar/api** and read the Adatszerkezet (data structure) page for the relevant endpoint. The docs clearly mark which fields are `GET`, `SET`, or both. For example, `Items.Item` on `/getOrder` and `/setOrder` is marked as both `GET` and `SET`, confirming it's readable and writable. Do NOT waste API calls on trial and error when the answer is in the docs.

### `<Action>modify</Action>` is REQUIRED for modifying existing records

All UNAS `/set*` endpoints (`/setOrder`, `/setProduct`, `/setScriptTag`, etc.) default to **create** when `<Action>` is omitted. If you forget `<Action>modify</Action>`, UNAS will either create a duplicate record or fail silently — it will NOT update the existing one. This is the most common mistake when using `n unas request` with raw XML. The high-level CLI commands always include this automatically.

### Minimize failed API calls to avoid IP bans

UNAS enforces strict rate limits: **20 failed calls = 1 hour IP ban on that endpoint**. Every malformed request, wrong XML structure, or missing field counts toward this limit. Plan your API calls carefully:

1. Read the docs first (see above)
2. Use `--xml` flag to inspect raw responses before making write calls
3. Use the high-level CLI commands (`orders items add/remove/set-qty`) instead of raw `request /setOrder` — they handle the XML structure correctly
4. If you must use `request`, build the XML body in a file and review it before sending
5. Test against a non-critical order first

## Advanced commands

### `request` — raw API call

Low-level escape hatch for any UNAS API call. Pass raw XML directly. Output is always raw XML.

```sh
n unas request /getProduct --xml-body '<Params><Limit>10</Limit></Params>'
n unas request /getScriptTag --xml-body '<Params><Id>123</Id></Params>'
n unas request /setOrder --xml-body-file order-update.xml
```

| Option            | Description      |
| ----------------- | ---------------- |
| `--xml-body`      | Inline XML body  |
| `--xml-body-file` | Path to XML file |

## Rate limits

| Plan    | Calls/hour | Notes                          |
| ------- | ---------- | ------------------------------ |
| PREMIUM | 2000       | per IP, all endpoints combined |
| VIP     | 6000       | per IP, all endpoints combined |

- 20 failed calls = 1h IP ban on that endpoint
- 10 bad auth attempts in 10 min = 2h IP ban on ALL UNAS APIs
- API maintenance window: midnight ±10 min
- Max XML payload: 128 MB for set calls

## m-cli diagnostics (`m unas`)

For operations/debugging, use `m unas`:

```sh
m unas debug <widgetId>       # full diagnostics for UNAS widget integration
m unas check-script           # verify script installation on merchant website
m unas ensure-script          # ensure script tag is present on storefront
```
