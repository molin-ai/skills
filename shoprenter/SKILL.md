---
name: shoprenter
description: Shoprenter CLI integration via `n shoprenter` commands. Use when working with the Shoprenter e-commerce platform, running `n shoprenter` commands, setting up Shoprenter authentication. Also use when the user mentions Shoprenter shop management, product/order/customer queries via the n-cli, or needs to connect to a Shoprenter store.
---

# Shoprenter CLI

Use `n shoprenter` (alias: `n sr`) to manage Shoprenter stores via the REST API.

The `shopname` is the subdomain, e.g. `molinai` from `molinai.myshoprenter.hu`.

Official Shoprenter API docs: https://doc.shoprenter.hu/api/

Run any command with `--help` to discover its parameters and usage.

## Auth

```sh
n shoprenter auth login # auto-detect shops linked to your Molin account
n shoprenter auth login molinai # log in to a specific shop
n shoprenter auth login molinai --username abc --password def # manual credentials
n shoprenter auth status # show active shop, credentials, and linked shops
n shoprenter auth logout # delete local credential cache
n shoprenter whoami # active shop and username
```

### Env var override (scripts/CI)

Skip the login flow by setting env vars directly:

```sh
export SHOPRENTER_USERNAME="user"
export SHOPRENTER_PASSWORD="pass"
export SHOPRENTER_SHOPNAME="myshopname"
```

## Resource commands

All resource commands are subcommand groups with these operations (unless restricted):

| Operation | Alias | Description                                             |
| --------- | ----- | ------------------------------------------------------- |
| `list`    | `ls`  | Paginated list with `--limit` (default 25) and `--page` |
| `get`     |       | Fetch single item by numeric inner ID or base64 ID      |
| `create`  |       | Create via `--body` (inline JSON) or `--body-file` path |
| `update`  |       | Partial update via `--body` or `--body-file`            |
| `delete`  | `rm`  | Delete by numeric inner ID or base64 ID                 |

All operations support `--json` for raw JSON output. Default output is a colored summary.

### Shop Data (full CRUD)

| Command                  | API endpoint             | Pretty output                       |
| ------------------------ | ------------------------ | ----------------------------------- |
| `products`               | `/products`              | inner ID, SKU, price, stock, status |
| `categories`             | `/categories`            | inner ID, name, status              |
| `orders`                 | `/orders`                | inner ID, date, status ref          |
| `order-products`         | `/orderProducts`         | inner ID, name, SKU, qty, price     |
| `order-totals`           | `/orderTotals`           | type, name, value                   |
| `order-histories`        | `/orderHistories`        | inner ID, date, status ref, comment |
| `customers`              | `/customers`             | inner ID, email, name               |
| `coupons`                | `/coupons`               | inner ID, code, discount, status    |
| `coupon-descriptions`    | `/couponDescriptions`    | inner ID, name, description         |
| `newsletter-subscribers` | `/newsletterSubscribers` | inner ID, email, name               |

Note: `order-histories` is read-only (list + get only).

### Shop Config

| Command                   | API endpoint               | Operations | Pretty output                |
| ------------------------- | -------------------------- | ---------- | ---------------------------- |
| `script-tags` (`scripts`) | `/scriptTags`              | full CRUD  | ID, scope, area, src/content |
| `order-statuses`          | `/orderStatusDescriptions` | list only  | name, color                  |
| `payment-modes`           | `/paymentModes`            | list only  | inner ID, name               |
| `shipping-modes`          | `/shippingModeExtend`      | list only  | inner ID, name               |

### Common options

```sh
n shoprenter products list --limit 50 --page 2     # pagination
n shoprenter products list --query published=1      # extra query params (repeatable)
n shoprenter products list --json                   # raw JSON output
n shoprenter products get 559                         # fetch by numeric inner ID
n shoprenter products get cHJvZHVjdC1wcm9kdWN0X2lkPTU1OQ==  # or by base64 ID
n shoprenter products create --body '{"status":"1","price":"19.99"}'
n shoprenter products create --body-file payload.json
n shoprenter products update 559 --body '{"price":"29.99"}'
n shoprenter products delete 559
```

### Script tags

Script tags (`script-tags`, alias `scripts`) have additional fields for creation/update:

| Field          | Description                                  |
| -------------- | -------------------------------------------- |
| `src`          | External script URL                          |
| `content`      | Inline script content (alternative to `src`) |
| `event`        | Trigger event (default: `ONLOAD`)            |
| `displayScope` | `FRONTEND`, `THANK_YOU_PAGE`, or `ALL`       |
| `displayArea`  | `HEADER` or `BODY`                           |

```sh
n shoprenter script-tags create --body '{"src":"https://cdn.example.com/widget.js","displayScope":"FRONTEND","displayArea":"HEADER"}'
```

### Coupons

**IMPORTANT:** When creating a coupon, you MUST also create a couponDescription via POST /couponDescriptions with name, description, coupon.id, and language.id. Without a couponDescription, the coupon will not appear in the Shoprenter admin UI.

Coupon fields (from https://doc.shoprenter.hu/api/coupon.html):

| Field                             | Description                                       | Required | Readonly |
| --------------------------------- | ------------------------------------------------- | -------- | -------- |
| `code`                            | Coupon code                                       | x        |          |
| `discountType`                    | `PERCENT` or `FIXED`                              |          |          |
| `percentDiscountValue`            | Percentage discount (when `discountType=PERCENT`) |          |          |
| `fixDiscountValue`                | Fixed discount (when `discountType=FIXED`)        |          |          |
| `status`                          | `0`=disabled, `1`=enabled                         |          |          |
| `loginRequired`                   | Customer must be logged in to use                 |          |          |
| `freeShipping`                    | Gives free shipping                               |          |          |
| `dateStart`, `dateEnd`            | Validity period                                   |          |          |
| `totalNumberOfCoupons`            | Total usage limit                                 |          |          |
| `totalNumberOfCouponsPerCustomer` | Per-customer usage limit                          |          |          |
| `email`                           | Restrict to specific email                        |          |          |
| `minOrderLimit`, `maxOrderLimit`  | Order value range                                 |          |          |
| `targetType`                      | `PRODUCT` or `CATEGORY`                           |          |          |
| `validToSpecialProducts`          | Combine with other discounts                      |          |          |
| `validWithGiftProducts`           | Use on gift promo items                           |          |          |
| `validWithBulkDiscount`           | Works with bulk discounts                         |          |          |
| `validWithLoyaltyPoints`          | Use alongside loyalty points                      |          |          |
| `bypassMinOrderLimitWithCoupon`   | Allow orders below min after coupon               |          |          |
| `taxClass`                        | Tax class resource link                           |          |          |
| `couponDescriptions`              | Link to multilingual descriptions                 |          |          |
| `dateCreated`, `dateUpdated`      | Timestamps                                        |          | x        |

Coupon description fields (`/couponDescriptions`): `name` (required), `description` (required), `coupon` (link, required, readonly), `language` (link, required, readonly). Filter by `couponId`, `languageId`, `code`.

Related: `/couponCategoryRelations`, `/couponProductRelations`.

## Popup via Script Tag

To create a frontend popup on Shoprenter (no external hosting required):

1. Write the popup as a self-executing JS function: `(function(){ ... })()`
2. Use `document.createElement` and **inline styles only** — CSS stylesheet injection breaks in `data:` URI scripts
3. Use **double quotes only** in all JS strings — single quotes break after URL-encoding in `data:` URIs
4. Use `insertAdjacentHTML("beforeend", ...)` for HTML content blocks
5. Wrap in `setTimeout(fn, ms)` for delayed popups, or run immediately
6. URL-encode the JS and deploy via:
   ```sh
   n shoprenter script-tags create --body-file payload.json
   ```
   where `payload.json` is:
   ```json
   {
     "src": "data:text/javascript,<url-encoded-js>",
     "displayScope": "FRONTEND",
     "displayArea": "BODY",
     "event": "ONLOAD"
   }
   ```
7. Use `sessionStorage` to control show frequency (once per session, etc.)

### Newsletter subscribe (optional)

To save emails as newsletter subscribers in Shoprenter, POST to the shop's frontend endpoint:

```
POST /index.php?route=module/newsletter_subscribe/subscribe
Content-Type: application/x-www-form-urlencoded

subscriber_email=<email>&subscriber_policy=1
```

## Advanced commands

### `resource` — generic CRUD

Access any Shoprenter API resource by name, including those without a dedicated command:

```sh
n shoprenter resource urlAliases list --limit 10
n shoprenter resource productDescriptions get <base64-id>
n shoprenter resource webHooks create --body '{"url":"https://example.com/hook"}'
```

Resource names are resolved via built-in aliases (camelCase, kebab-case, singular/plural all accepted). If unrecognized, the name is used as a literal API path.

### `request` — raw API call

Low-level escape hatch for any Shoprenter API call:

```sh
n shoprenter request /products --method GET --json
n shoprenter request /batch --method POST --body '{"requests":[...]}'
n shoprenter request /orderExtend/abc123 --method GET
```

| Option        | Default | Description                          |
| ------------- | ------- | ------------------------------------ |
| `--method`    | `GET`   | HTTP method (GET, POST, PUT, DELETE) |
| `--body`      |         | Inline JSON body                     |
| `--body-file` |         | Path to JSON file, or `-` for stdin  |
| `--json`      | `false` | Output raw JSON                      |

## Resource name aliases

The `resource` command resolves these names to API endpoints. All support hyphenated and camelCase forms.

- **Core:** products, categories, customers, orders, coupons, couponDescriptions, couponCategoryRelations, couponProductRelations, newsletterSubscribers
- **Orders:** orderProducts, orderTotals, orderHistories, orderInvoices, orderProductOptions, orderProductAddons, orderCreditCards
- **Products:** productImages, productDescriptions, productSpecials, productOptions, productOptionValues, productOptionValueDescriptions, productTags, productBadges, productBadgeDescriptions, productCategoryRelations, productRelatedProductRelations, productCollateralProductRelations, productAddons, productAddonProductRelations, productClasses, productClassAttributeRelations, productDocumentRelations, productListAttributeValueRelations, productProductBadgeRelations
- **Config:** scriptTags, orderStatuses, orderStatusDescriptions, paymentModes, shippingModes, shippingLanes, shippingModeDescriptions
- **Extend:** productExtend, categoryExtend, orderExtend, customerExtend, shippingModeExtend, taxClassExtend
- **Attributes:** listAttributes, listAttributeValues, listAttributeValueDescriptions, listAttributeWidgets, numberAttributes, numberAttributeValues, numberAttributeWidgets, numberAttributeWidgetLimits, textAttributes, textAttributeValues, textAttributeValueDescriptions, attributeDescriptions, attributeWidgetDescriptions, attributeWidgetCategoryRelations
- **Geo:** addresses, countries, zones, geoZones
- **CMS:** cmsContentCmsListRelations, cmsContentDescriptions, cmsContentExtend, cmsContentListDescriptions, cmsContentListExtend, informationDescriptions, informationExtends
- **Other:** manufacturers, manufacturerDescriptions, taxClasses, taxRates, stockStatuses, stockStatusDescriptions, customerGroups, customerGroupProductPrices, categoryCustomerGroupRelations, loyaltyPoints, loyaltyPointsUsed, documents, documentDescriptions, files, urlAliases, languages, currencies, domains, settings, webHooks, priceMultipliers, weightClasses, weightClassDescriptions, lengthClasses, lengthClassDescriptions, reloadOrderUrls
