# Shoprenter MCP Tools Reference

Read this for the full list of available tools and their OAuth scopes.

## Usage

```sh
n shoprenter <tool-name> '<json-args>'
```

To discover params for any tool, run `n shoprenter <tool-name>` (no args) to see the input schema.

## Available tools by category

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
