---
name: shoptet
description: Shoptet CLI integration via `n shoptet` commands. Use when working with the Shoptet e-commerce platform, running `n shoptet` commands, setting up Shoptet authentication. Also use when the user mentions Shoptet shop management, product/order/customer/category queries via the n-cli, or needs to connect to a Shoptet store.
---

# Shoptet CLI

Use `n shoptet` to manage Shoptet shops via the Private API.

All requests are to `https://api.myshoptet.com/api` with the `Shoptet-Private-API-Token` auth header. API tokens are in the format `XXXXXX-p-XXXXXX-XXXXXXXXXXXXXXXXXXXX`.

Official Shoptet API docs: https://api.docs.shoptet.com/ and https://developers.shoptet.com/

Run any command with `--help` to discover its parameters and usage.

## Auth

```sh
n shoptet auth <apiToken>  # validate token + store in Ninja vault
```

### Env var override (scripts/CI)

Skip the Ninja vault by setting the env var directly:

```sh
export SHOPTET_API_TOKEN="xxx-x-xxx-xxx"
```

## Resource commands

### Products (`n shoptet products`)

| Operation | Description                        |
| --------- | ---------------------------------- |
| `list`    | Paginated product list             |
| `get`     | Fetch by GUID                      |
| `create`  | Create new product                 |
| `update`  | Update existing product (not impl) |
| `delete`  | Delete product by GUID             |

```sh
n shoptet products list --limit 50 --page 2 --visibility visible
n shoptet products list --json
n shoptet products get <guid>
n shoptet products get <guid> --include images
n shoptet products create --name "Product Name" --default-category-guid <guid> --variants '[{"code":"ABC","price":9990}]'
n shoptet products delete <guid>
```

Options: `--limit`, `--page`, `--visibility visible|hidden|detail-only`, `--include images|variants|...`, `--json`

### Orders (`n shoptet orders`)

| Operation | Description                      |
| --------- | -------------------------------- |
| `list`    | Paginated order list             |
| `get`     | Fetch by order code              |
| `create`  | Create new order                 |
| `status`  | Update order status/paid/billing |
| `history` | View order history               |
| `delete`  | Delete order by code             |

```sh
n shoptet orders list --limit 10 --page 2
n shoptet orders list --json
n shoptet orders get <code>
n shoptet orders get <code> --include notes
n shoptet orders create --external-code ORDER-001 --currency-code CZK --items '[...]'
n shoptet orders status <code> --status-id 2 --paid true
n shoptet orders history <code> [--system true|false]
n shoptet orders delete <code>
```

List options: `--limit`, `--page`, `--json`
Get options: `--include notes|...`, `--json`
Status options: `--status-id`, `--paid true|false`, `--billing-method-id`, `--suppress-email`, `--suppress-sms`, `--suppress-document`, `--json`
History options: `--system true|false`, `--json`

### Customers (`n shoptet customers`)

| Operation | Description             |
| --------- | ----------------------- |
| `list`    | Paginated customer list |
| `get`     | Fetch by GUID           |
| `create`  | Create new customer     |
| `update`  | Update customer fields  |
| `delete`  | Delete customer by GUID |

```sh
n shoptet customers list --limit 100 --page 2
n shoptet customers get <guid>
n shoptet customers create --email user@example.com [--remark "VIP"]
n shoptet customers update <guid> --remark "Updated note" [--price-ratio 0.95]
n shoptet customers delete <guid>
```

List options: `--limit`, `--page`, `--json`
Update options: `--remark`, `--price-ratio`, `--birth-date`, `--disabled-orders`, `--customer-group-code`, `--pricelist-id`, `--billing-address`, `--json`

### Categories (`n shoptet categories`)

| Operation | Description             |
| --------- | ----------------------- |
| `list`    | Paginated category list |
| `get`     | Fetch by GUID           |
| `create`  | Create new category     |
| `update`  | Update category fields  |
| `delete`  | Delete category by GUID |

```sh
n shoptet categories list --limit 50
n shoptet categories get <guid>
n shoptet categories create --name "Category Name" [--parent-guid <guid>]
n shoptet categories update <guid> --name "Updated Name" [--visible true]
n shoptet categories delete <guid> [--delete-used] [--delete-children]
```

Delete options: `--delete-used`, `--delete-children`

### Brands (`n shoptet brands`)

| Operation | Description          |
| --------- | -------------------- |
| `list`    | Paginated brand list |
| `get`     | Fetch by GUID        |
| `create`  | Create new brand     |
| `update`  | Update brand fields  |
| `delete`  | Delete brand by GUID |

```sh
n shoptet brands list --limit 50
n shoptet brands get <guid>
n shoptet brands create --name "Brand Name"
n shoptet brands update <guid> --name "Updated Name" [--brand-web "https://..."]
n shoptet brands delete <guid>
```

Update options: `--name`, `--brand-web`, `--contact-email`, `--description`, `--json`

### Pages (`n shoptet pages`)

| Operation | Description         |
| --------- | ------------------- |
| `list`    | Paginated page list |
| `get`     | Fetch by numeric ID |
| `create`  | Create new page     |
| `update`  | Update page fields  |
| `delete`  | Delete page by ID   |

```sh
n shoptet pages list --limit 50
n shoptet pages get <id>
n shoptet pages create --title "Page Title" [--visible true]
n shoptet pages update <id> --title "Updated Title" [--visible false]
n shoptet pages delete <id>
```

Update options: `--title`, `--visible`, `--description`, `--link-text`, `--meta-title`, `--meta-description`, `--canonical-url`, `--access`, `--json`

### Articles (`n shoptet articles`)

| Operation | Description            |
| --------- | ---------------------- |
| `list`    | Paginated article list |
| `get`     | Fetch by numeric ID    |
| `create`  | Create new article     |
| `update`  | Update article fields  |
| `delete`  | Delete article by ID   |

```sh
n shoptet articles list --limit 50
n shoptet articles get <id>
n shoptet articles create --title "Article Title" --default-section-id 682
n shoptet articles update <id> --title "Updated Title" [--visible true]
n shoptet articles delete <id>
```

Update options: `--title`, `--visible`, `--content`, `--default-section-id`, `--json`

### Webhooks (`n shoptet webhooks`)

| Operation  | Description          |
| ---------- | -------------------- |
| `list`     | List all webhooks    |
| `register` | Register new webhook |
| `update`   | Update webhook URL   |
| `delete`   | Delete webhook by ID |

```sh
n shoptet webhooks list
n shoptet webhooks register <event> <url>
n shoptet webhooks update <id> --url <new-url>
n shoptet webhooks delete <id>
```

Register supports events like `order:create`, `order:update`, `product:create`, etc.

## Standalone resource commands

| Command                  | Description                         | Key options                                                             |
| ------------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| `info`                   | Get e-shop info                     | `--include orderStatuses,paymentMethods,shippingMethods,imageCuts,urls` |
| `stocks`                 | List stock levels                   | `--json`                                                                |
| `payment-methods`        | List payment methods                | `--json`                                                                |
| `shipping-methods`       | List shipping methods               | `--json`                                                                |
| `suppliers`              | List suppliers (paginated)          | `--limit`, `--page`, `--json`                                           |
| `discounts coupons`      | List/create/delete discount coupons | `list`, `create`, `delete`                                              |
| `discounts quantity`     | List quantity discounts             | `--json`                                                                |
| `discounts volume`       | List volume discounts               | `--json`                                                                |
| `discounts xy`           | List X+Y discounts                  | `--json`                                                                |
| `docs invoices`          | List invoices (paginated)           | `--limit`, `--page`, `--json`                                           |
| `docs credit-notes`      | List credit notes (paginated)       | `--limit`, `--page`, `--json`                                           |
| `docs delivery-notes`    | List delivery notes (paginated)     | `--limit`, `--page`, `--json`                                           |
| `docs proforma-invoices` | List proforma invoices (paginated)  | `--limit`, `--page`, `--json`                                           |
| `docs proof-payments`    | List proof of payments (paginated)  | `--limit`, `--page`, `--json`                                           |

```sh
n shoptet info [--include orderStatuses,paymentMethods]
n shoptet stocks
n shoptet payment-methods
n shoptet shipping-methods
n shoptet suppliers --limit 100
n shoptet discounts coupons list [--limit 50]
n shoptet discounts coupons create --code DISCOUNT10 --discount-type percentual --ratio 10 --reusable true --template <uuid> --shipping-price beforeDiscount
n shoptet discounts coupons delete <code>
n shoptet docs invoices --limit 10
```

All standalone commands support `--json` for raw JSON output.

### Discount coupons

Coupon create options: `--code` (required), `--discount-type percentual|amount` (required), `--ratio` or `--amount` (required), `--reusable true|false` (required), `--template <uuid>` (required), `--shipping-price beforeDiscount|afterDiscount` (required), `--valid-from`, `--valid-to`, `--min-price`, `--currency`, `--remark`

### Template injection (`n shoptet inject`)

| Operation | Description                 |
| --------- | --------------------------- |
| `show`    | List all template includes  |
| `set`     | Add/update template include |

```sh
n shoptet inject show
n shoptet inject set <location> <code>
n shoptet inject set header '<script src="..."></script>'
```

Location aliases: `header` → `common-header`, `footer` → `common-footer`, `thankyou` → `order-confirmed`. Unknown aliases pass through as-is.

## API shapes

### Pagination

All paginated endpoints return:

```json
{
  "data": {
    "items": [...],
    "paginator": {
      "page": 1,
      "itemsPerPage": 25,
      "totalCount": 100
    }
  }
}
```

### Create/update patterns

- **Create** requests wrap payload in `{ data: {...} }`
- **Update** requests wrap payload in `{ data: {...} }`
- **List** responses return arrays under resource-specific keys (e.g. `products`, `orders`, `customers`)
- **Get** responses return objects under resource-specific keys (e.g. `product`, `order`, `customer`) or directly in `data`

### Response wrapping

- Products: `GET /products/{guid}` → object directly in `data` (no wrapper key)
- Orders: `GET /orders/{code}` → `{ order: {...} }`
- Categories: `GET /categories/{guid}` → object directly in `data`
- Brands: `GET /brands/{guid}` → object directly in `data`

## Rate limits

Refer to Shoptet API documentation for current rate limits and quotas.

## Test credentials

Sandbox shop: https://672207.myshoptet.com
Sandbox API token: stored in `packages/n-cli/lib/shoptet/testing.js`
