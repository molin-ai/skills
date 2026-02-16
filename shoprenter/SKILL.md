---
name: shoprenter
description: Shoprenter CLI integration via `n shoprenter` commands. Use when working with the Shoprenter e-commerce platform, running `n shoprenter` commands, setting up Shoprenter authentication. Also use when the user mentions Shoprenter shop management, product/order/customer queries via the n-cli, or needs to connect to a Shoprenter store.
---

# Shoprenter CLI

Use `n shoprenter` to manage Shoprenter stores — authenticate, call the official MCP, query products/orders/customers.

The `shopname` is the subdomain, e.g. `myshop` from `myshop.shoprenter.hu`.

## Getting started

### 1. Log in

```sh
n shoprenter auth login            # auto-detect shops linked to your Molin account
n shoprenter auth login molinai    # log in to a specific shop
```

If the shop hasn't approved scopes yet, you'll see an approval URL to visit first.

Tokens are cached locally and refreshed automatically. You only need to log in once.

### 2. Check status

```sh
n shoprenter auth status           # show which shop is active and all linked shops
```

### 3. Use tools

```sh
n shoprenter mcp list                    # list all available tools
n shoprenter mcp list --descriptions     # include tool descriptions
n shoprenter mcp run <tool>              # show a tool's schema (no call)
n shoprenter mcp run <tool> '{}'         # call a tool with empty params
n shoprenter mcp run <tool> '{"limit":5}'          # call with params
echo '{"limit":5}' | n shoprenter mcp run <tool> - # pipe JSON from stdin
```

### Output options

| Flag             | Effect                            |
| ---------------- | --------------------------------- |
| `--descriptions` | include tool descriptions in list |
| `--json`         | output as JSON                    |
| `--raw`          | output raw text content only      |

### Env var override (scripts/CI)

Skip the login flow by setting these env vars:

```sh
export SHOPRENTER_ACCESS_TOKEN="eyJ..."
export SHOPRENTER_SHOP_NAME="myshopname"
```

## Available tools

Run `n shoprenter mcp run <tool-name>` (no args) to see a tool's input schema.

### Products

| Tool                                            | Params                                                    |
| ----------------------------------------------- | --------------------------------------------------------- |
| `shoprenter-get-products`                       | `page?, limit?, full?, innerId?, sku?`                    |
| `shoprenter-get-product`                        | `id`                                                      |
| `shoprenter-search-products`                    | `keyword, page?, limit?`                                  |
| `shoprenter-update-product-seo`                 | `productId, languageId, name?, metaTitle?, metaKeywords?` |
| `shoprenter-get-product-specials`               | `page?, limit?, productId?, full?`                        |
| `shoprenter-get-product-special`                | `id, full?`                                               |
| `shoprenter-create-product-special`             | `priority, price, dateFrom, dateTo, productId`            |
| `shoprenter-update-product-special`             | `id, priority?, price?, dateFrom?, dateTo?`               |
| `shoprenter-delete-product-special`             | `id`                                                      |
| `shoprenter-get-product-stocks`                 | `productId?, sku?`                                        |
| `shoprenter-update-product-stocks`              | `productId?, sku?, stock1?, stock2?, stock3?`             |
| `shoprenter-get-product-physical-attributes`    | `productId?, sku?`                                        |
| `shoprenter-update-product-physical-attributes` | `productId?, sku?, weight?, width?, height?`              |
| `shoprenter-get-product-catalog-info`           | `productId?, sku?`                                        |
| `shoprenter-update-product-catalog-info`        | `productId?, sku?, modelNumber?, status?, orderable?`     |
| `shoprenter-get-product-category-relations`     | `page?, limit?, full?, productId?, categoryId?`           |
| `shoprenter-get-product-category-relation`      | `id`                                                      |
| `shoprenter-get-product-attributes`             | `productId?`                                              |

### Product addons

| Tool                            | Params                 |
| ------------------------------- | ---------------------- |
| `shoprenter-get-product-addons` | `page?, limit?, full?` |
| `shoprenter-get-product-addon`  | `id`                   |

### Categories

| Tool                                               | Params                                                |
| -------------------------------------------------- | ----------------------------------------------------- |
| `shoprenter-get-categories`                        | `page?, limit?, full?, innerId?`                      |
| `shoprenter-get-category`                          | `id`                                                  |
| `shoprenter-get-category-tree`                     | _(none)_                                              |
| `shoprenter-get-category-descriptions`             | `page?, limit?, full?, categoryId?`                   |
| `shoprenter-get-category-customer-group-relations` | `page?, limit?, full?, categoryId?, customerGroupId?` |
| `shoprenter-get-category-customer-group-relation`  | `id`                                                  |

### Orders

| Tool                                              | Params                                                        |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `shoprenter-get-orders`                           | `page?, limit?, emailFilter?, statusFilter?, dateFromFilter?` |
| `shoprenter-get-order`                            | `id`                                                          |
| `shoprenter-get-order-statistics`                 | `dateFrom?, dateTo?`                                          |
| `shoprenter-get-order-summary`                    | `orderId`                                                     |
| `shoprenter-get-order-products`                   | `page?, limit?, full?, orderId?`                              |
| `shoprenter-get-order-product`                    | `id`                                                          |
| `shoprenter-get-order-totals`                     | `page?, limit?, full?, orderId?`                              |
| `shoprenter-get-order-total`                      | `id`                                                          |
| `shoprenter-get-order-statuses`                   | `page?, limit?, full?`                                        |
| `shoprenter-get-order-status`                     | `id`                                                          |
| `shoprenter-get-order-status-descriptions`        | `page?, limit?, full?, orderStatusId?`                        |
| `shoprenter-get-order-status-description`         | `id`                                                          |
| `shoprenter-get-order-invoices`                   | `page?, limit?, full?`                                        |
| `shoprenter-get-order-invoice`                    | `id`                                                          |
| `shoprenter-get-order-invoices-by-order`          | `orderId`                                                     |
| `shoprenter-get-order-product-options`            | `page?, limit?, full?`                                        |
| `shoprenter-get-order-product-option`             | `id`                                                          |
| `shoprenter-get-order-product-options-by-product` | `orderProductId`                                              |
| `shoprenter-get-order-product-addons`             | `page?, limit?, full?`                                        |
| `shoprenter-get-order-product-addon`              | `id`                                                          |
| `shoprenter-get-order-product-addons-by-order`    | `orderId`                                                     |

### Customers

| Tool                                     | Params                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| `shoprenter-get-customers`               | `page?, limit?, emailFilter?, nameFilter?, phoneFilter?` |
| `shoprenter-get-customer`                | `id`                                                     |
| `shoprenter-search-customers`            | `keyword, page?, limit?`                                 |
| `shoprenter-get-customer-statistics`     | _(none)_                                                 |
| `shoprenter-get-customer-addresses`      | `customerId`                                             |
| `shoprenter-get-customer-loyalty-points` | `customerId`                                             |

### Customer groups

| Tool                                           | Params                                               |
| ---------------------------------------------- | ---------------------------------------------------- |
| `shoprenter-get-customer-groups`               | `page?, limit?, nameFilter?, full?`                  |
| `shoprenter-get-customer-group`                | `id`                                                 |
| `shoprenter-get-customers-in-group`            | `groupId, page?, limit?`                             |
| `shoprenter-get-customer-group-statistics`     | _(none)_                                             |
| `shoprenter-get-customer-group-product-prices` | `page?, limit?, productId?, customerGroupId?, full?` |
| `shoprenter-get-customer-group-product-price`  | `id`                                                 |

### Localization

| Tool                            | Params                 |
| ------------------------------- | ---------------------- |
| `shoprenter-get-geozones`       | `page?, limit?, full?` |
| `shoprenter-get-geozone`        | `id`                   |
| `shoprenter-get-languages`      | `page?, limit?, full?` |
| `shoprenter-get-language`       | `id`                   |
| `shoprenter-get-weight-classes` | `page?, limit?, full?` |
| `shoprenter-get-weight-class`   | `id`                   |
| `shoprenter-get-length-classes` | `page?, limit?, full?` |
| `shoprenter-get-length-class`   | `id`                   |
| `shoprenter-get-tax-classes`    | `page?, limit?, full?` |
| `shoprenter-get-tax-class`      | `id`                   |

### Stock statuses

| Tool                            | Params                 |
| ------------------------------- | ---------------------- |
| `shoprenter-get-stock-statuses` | `page?, limit?, full?` |
| `shoprenter-get-stock-status`   | `id`                   |

### Coupons

| Tool                                         | Params                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `shoprenter-get-coupons`                     | `page?, limit?, full?, code?`                                                |
| `shoprenter-get-coupon`                      | `id`                                                                         |
| `shoprenter-create-coupon`                   | `code, discountType, percentDiscountValue?, fixDiscountValue?, descriptions` |
| `shoprenter-update-coupon`                   | `id, code?, discountType?, percentDiscountValue?, fixDiscountValue?`         |
| `shoprenter-delete-coupon`                   | `id`                                                                         |
| `shoprenter-get-coupon-product-relations`    | `page?, limit?, full?, couponId?`                                            |
| `shoprenter-get-coupon-product-relation`     | `id`                                                                         |
| `shoprenter-create-coupon-product-relation`  | `couponId, productId`                                                        |
| `shoprenter-delete-coupon-product-relation`  | `id`                                                                         |
| `shoprenter-get-coupon-category-relations`   | `page?, limit?, full?, couponId?`                                            |
| `shoprenter-get-coupon-category-relation`    | `id`                                                                         |
| `shoprenter-create-coupon-category-relation` | `couponId, categoryId`                                                       |
| `shoprenter-delete-coupon-category-relation` | `id`                                                                         |

### CMS content

| Tool                                          | Params                                                        |
| --------------------------------------------- | ------------------------------------------------------------- |
| `shoprenter-create-cms-content`               | `sortOrder?, enabled?, author?, datePublished?, descriptions` |
| `shoprenter-get-cms-content-lists`            | `page?, limit?, full?`                                        |
| `shoprenter-get-cms-content-list`             | `id`                                                          |
| `shoprenter-get-cms-content-list-relations`   | `page?, limit?, full?, cmsContentId?, cmsContentListId?`      |
| `shoprenter-create-cms-content-list-relation` | `cmsContentId, cmsContentListId`                              |
| `shoprenter-delete-cms-content-list-relation` | `id`                                                          |

### Utility

| Tool                         | Params   |
| ---------------------------- | -------- |
| `shoprenter-test-connection` | _(none)_ |
