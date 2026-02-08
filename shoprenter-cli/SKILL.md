---
name: shoprenter-cli
description: Shoprenter CLI integration via `n shoprenter` commands. Use when working with the Shoprenter e-commerce platform, running `n shoprenter` commands, setting up Shoprenter authentication, exchanging SSO tokens for access tokens, refreshing expired tokens, or modifying Shoprenter CLI subcommands. Also use when the user mentions Shoprenter shop management, product/order/customer queries via the n-cli, or needs to connect to a Shoprenter store.
---

# Shoprenter CLI

CLI for interacting with Shoprenter stores via MCP (JSON-RPC 2.0 over HTTP).

## Authentication

The CLI requires `SHOPRENTER_ACCESS_TOKEN` and `SHOPRENTER_SHOP_NAME` env vars. Ask the user for **shop name** and **SSO token** before proceeding.

### Obtaining the SSO token

The SSO token can be found on any Shoprenter admin page in the DOM:

```js
document.ShopRenter.userData.ssoToken;
```

Ask the user to open their Shoprenter admin panel, open the browser console, and run the above to get the token.

### Obtaining an access token from an SSO token

Exchange an SSO token for an OAuth2 access token using the Token Exchange grant (RFC 8693). The `SHOPRENTER_CLIENT_ID` and `SHOPRENTER_CLIENT_SECRET` are available as global env vars.

```sh
curl -s -X POST "https://oauth.app.shoprenter.net/{shopName}/admin/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "token_exchange",
    "subject_token_type": "sso_token",
    "subject_token": "{ssoToken}",
    "client_id": "'"$SHOPRENTER_MCP_CLIENT_ID"'",
    "client_secret": "'"$SHOPRENTER_MCP_CLIENT_SECRET"'"
  }'
```

Response (access token valid 1 hour, refresh token valid 30 days):

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJ..."
}
```

### Refreshing an expired access token

When an access token expires (after 1 hour), exchange the refresh token for a new access token:

```sh
curl -s -X POST "https://oauth.app.shoprenter.net/{shopName}/admin/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "client_id": "'"$SHOPRENTER_MCP_CLIENT_ID"'",
    "client_secret": "'"$SHOPRENTER_MCP_CLIENT_SECRET"'",
    "refresh_token": "{refreshToken}"
  }'
```

The refresh token is valid for 30 days.

## Usage

Set env vars and run commands directly:

```sh
export SHOPRENTER_ACCESS_TOKEN="eyJ..."
export SHOPRENTER_SHOP_NAME="myshopname"

n shoprenter list                                            # list all available tools
n shoprenter list --withDescriptions                         # list with descriptions
n shoprenter shoprenter-test-connection                      # show tool schema
n shoprenter shoprenter-test-connection '{}'                 # call tool (no params)
n shoprenter shoprenter-get-products '{"limit":5}'           # call tool with inline JSON
echo '{"limit":5}' | n shoprenter shoprenter-get-products -  # call tool with stdin JSON
n shoprenter shoprenter-get-products '{"limit":5}' --json    # output full JSON-RPC result
n shoprenter shoprenter-get-products '{"limit":5}' --raw     # output raw text content only
```

Tools are called by their full MCP name (e.g. `shoprenter-get-products`).

### Options

| Option               | Description                       |
| -------------------- | --------------------------------- |
| `--withDescriptions` | include tool descriptions in list |
| `--json`             | output as JSON (for scripting)    |
| `--raw`              | output raw text content           |

### Behaviour

- `n shoprenter` or `n shoprenter list` lists all tools
- `n shoprenter <tool>` shows tool schema (name, description, input schema)
- `n shoprenter <tool> '<json>'` calls the tool with inline JSON args
- `n shoprenter <tool> -` reads JSON args from stdin

## Architecture

### Key files

| File                               | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `packages/n-cli/utils/mcp.js`      | General MCP JSON-RPC 2.0 client via fetch()     |
| `packages/n-cli/cmd/shoprenter.js` | Single command with positional args and options |
| `packages/n-cli/bin/cli.js`        | CLI entry point                                 |

## Available tools

To discover params for any tool, run `n shoprenter <tool-name>` (no args) to see the input schema.

### Products (`mcp.product.product:read`, `mcp.product.product:write`)

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

### Product addons (`mcp.product.addon:read`)

| Tool                            | Params                 |
| ------------------------------- | ---------------------- |
| `shoprenter-get-product-addons` | `page?, limit?, full?` |
| `shoprenter-get-product-addon`  | `id`                   |

### Categories (`mcp.product.category:read`)

| Tool                                               | Params                                                |
| -------------------------------------------------- | ----------------------------------------------------- |
| `shoprenter-get-categories`                        | `page?, limit?, full?, innerId?`                      |
| `shoprenter-get-category`                          | `id`                                                  |
| `shoprenter-get-category-tree`                     | _(none)_                                              |
| `shoprenter-get-category-descriptions`             | `page?, limit?, full?, categoryId?`                   |
| `shoprenter-get-category-customer-group-relations` | `page?, limit?, full?, categoryId?, customerGroupId?` |
| `shoprenter-get-category-customer-group-relation`  | `id`                                                  |

### Orders (`mcp.order.order:read`)

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

### Customers (`mcp.customer.customer:read`)

| Tool                                     | Params                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| `shoprenter-get-customers`               | `page?, limit?, emailFilter?, nameFilter?, phoneFilter?` |
| `shoprenter-get-customer`                | `id`                                                     |
| `shoprenter-search-customers`            | `keyword, page?, limit?`                                 |
| `shoprenter-get-customer-statistics`     | _(none)_                                                 |
| `shoprenter-get-customer-addresses`      | `customerId`                                             |
| `shoprenter-get-customer-loyalty-points` | `customerId`                                             |

### Customer groups (`mcp.customer.customerGroup:read`)

| Tool                                           | Params                                               |
| ---------------------------------------------- | ---------------------------------------------------- |
| `shoprenter-get-customer-groups`               | `page?, limit?, nameFilter?, full?`                  |
| `shoprenter-get-customer-group`                | `id`                                                 |
| `shoprenter-get-customers-in-group`            | `groupId, page?, limit?`                             |
| `shoprenter-get-customer-group-statistics`     | _(none)_                                             |
| `shoprenter-get-customer-group-product-prices` | `page?, limit?, productId?, customerGroupId?, full?` |
| `shoprenter-get-customer-group-product-price`  | `id`                                                 |

### Localization

| Tool                            | Scope                              | Params                 |
| ------------------------------- | ---------------------------------- | ---------------------- |
| `shoprenter-get-geozones`       | `mcp.localization.location:read`   | `page?, limit?, full?` |
| `shoprenter-get-geozone`        | `mcp.localization.location:read`   | `id`                   |
| `shoprenter-get-languages`      | `mcp.localization.language:read`   | `page?, limit?, full?` |
| `shoprenter-get-language`       | `mcp.localization.language:read`   | `id`                   |
| `shoprenter-get-weight-classes` | `mcp.localization.weightUnit:read` | `page?, limit?, full?` |
| `shoprenter-get-weight-class`   | `mcp.localization.weightUnit:read` | `id`                   |
| `shoprenter-get-length-classes` | `mcp.localization.lengthUnit:read` | `page?, limit?, full?` |
| `shoprenter-get-length-class`   | `mcp.localization.lengthUnit:read` | `id`                   |
| `shoprenter-get-tax-classes`    | `mcp.taxClass.taxClass:read`       | `page?, limit?, full?` |
| `shoprenter-get-tax-class`      | `mcp.taxClass.taxClass:read`       | `id`                   |

### Stock statuses (`mcp.product.stockStatus:read`)

| Tool                            | Params                 |
| ------------------------------- | ---------------------- |
| `shoprenter-get-stock-statuses` | `page?, limit?, full?` |
| `shoprenter-get-stock-status`   | `id`                   |

### Coupons (`mcp.marketing.coupon:read`, `mcp.marketing.coupon:write`)

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

### CMS content (`mcp.cms.content:read`, `mcp.cms.content:write`)

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
