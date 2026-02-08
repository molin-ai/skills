---
name: shoper
description: Shoper.pl e-commerce - REST API, themes, webhooks. Use for Shoper stores, API calls, theme customization.
---

# Shoper.pl Reference

## Safety Rules

- **Confirm before modifying production** - orders, products, customers
- **GET first** - understand data before POST/PUT/DELETE
- **Never expose tokens** in outputs
- Docs: developers.shoper.pl

---

## Authentication

**Base URL:** `https://{shop}.shoparena.pl/webapi/rest/`

```bash
# Login - get token
curl -X POST "https://{shop}.shoparena.pl/webapi/rest/auth" -u "user:pass"
# Returns: {"access_token":"xxx","expires_in":3600,"token_type":"bearer"}

# Use token (expires in 1hr)
curl -H "Authorization: Bearer {token}" "https://{shop}.shoparena.pl/webapi/rest/products"
```

**Get credentials:** Admin → Integracje → WebAPI (not admin login)

**Env vars method:**

```bash
export SHOPER_URL="shop.shoparena.pl" SHOPER_USER="user" SHOPER_PASS="pass"
TOKEN=$(curl -s -X POST "https://$SHOPER_URL/webapi/rest/auth" -u "$SHOPER_USER:$SHOPER_PASS" | jq -r '.access_token')
```

---

## API Endpoints

| Endpoint                              | Description         |
| ------------------------------------- | ------------------- |
| `/products`                           | Product catalog     |
| `/categories`                         | Categories          |
| `/orders`                             | Orders              |
| `/order-products`                     | Order items         |
| `/customers`                          | Customers           |
| `/webhooks`                           | Event subscriptions |
| `/statuses` `/deliveries` `/payments` | Order config        |
| `/producers` `/taxes` `/currencies`   | Catalog config      |

**CRUD:**

```bash
GET    /products              # List
GET    /products/{id}         # Single
POST   /products              # Create (Content-Type: application/json)
PUT    /products/{id}         # Update
DELETE /products/{id}         # Delete (DANGER)
```

**Filtering:** `?limit=50&page=2` or `?filters[category_id]=5`

**Response:** `{"count":100,"pages":10,"page":1,"list":[...]}`

---

## Webhooks

**Setup:** Admin → Add-ons → Webhooks → Add (URL, JSON format, select events)

**Events:** `order/create`, `order/edit`, `order/status`, `order/paid`, `product/create`, `product/edit`, `product/delete`, `customer/create`, `customer/edit`

**Payload:** `{"event":"order/create","shop":"...","timestamp":...,"data":{...}}`

---

## Theme Development

### Safe Workflow (NEVER edit live template)

```
1. DUPLICATE → Admin: Wygląd i treści → Wygląd sklepu → hover → "Duplikuj"
2. DEVELOP   → Edit the copy only
3. ACTIVATE  → "Więcej" → "Aktywny w sklepie" when ready
```

### Local Dev (Safe Mode)

```bash
git clone https://github.com/arktosk/shoper-vue-boilerplate && cd shoper-vue-boilerplate
npm install
# Create .env: WEBDAV_HOSTNAME, WEBDAV_USER, WEBDAV_PASSWORD, WEBDAV_TEMPLATE_NAME
npm start          # Safe mode - local only, no deploy
npm run deploy     # Deploy when ready
```

### Twig Syntax

```twig
{{ product.name }}                           {# Output #}
{{ product.price | money }}                  {# Filter #}
{% if product.available %}...{% endif %}     {# Condition #}
{% for item in products %}...{% endfor %}    {# Loop #}
{% set products = ObjectApi.getProducts() %} {# Object API #}
```

**Objects:** `Product`, `Category`, `Cart`, `Customer`, `Order`, `Shop`, `Locale`

**Product props:** `product_id`, `name`, `description`, `price`, `price_gross`, `stock.quantity`, `producer.name`, `main_image.url`, `variants`, `images`

### File Structure

```
theme/
├── layouts/default.tpl
├── templates/{index,product,category,cart,checkout,account}.tpl
├── modules/{header,footer,product-tile,menu}.tpl
├── assets/{css,js,images}/
└── config.json
```

### Macros

```twig
{% import 'macros/buttons.tpl' as buttons %}
{% import 'macros/forms.tpl' as forms %}
{{ buttons.primary('Add to Cart', {'class': 'btn-cart'}) }}
{{ forms.input('email', 'Email', {'required': true}) }}
```

### JS API

```javascript
Shoper.EventBus.emit("cart:add", { productId: 123, quantity: 1 });
Shoper.EventBus.on("cart:updated", (data) => {});
Shoper.Forms.validate("#form");
```

---

## AppStore Development

**OAuth Flow:** User installs app → Redirect with auth code → Exchange for access_token → Use token for API

**Libraries:**

```bash
composer require dreamcommerce/shop-appstore-lib  # PHP (official)
npm install shoper-api                            # Node.js
pip install python-shoper                         # Python
```

---

## Common Operations

```bash
# Get products
curl -H "Authorization: Bearer $TOKEN" "$SHOPER_URL/webapi/rest/products?limit=100"

# Update order status
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status_id":3}' "$SHOPER_URL/webapi/rest/orders/12345"

# Create product
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"translations":{"pl_PL":{"name":"Product","description":"..."}},"stock":{"price":99.99,"stock":100},"category_id":5}' \
  "$SHOPER_URL/webapi/rest/products"
```

---

## Troubleshooting

| Error | Fix                             |
| ----- | ------------------------------- |
| 401   | Token expired/invalid - re-auth |
| 404   | Check resource ID and URL       |
| 422   | Missing required fields         |

**Debug:** `curl -v ...` for full response

**Docs:** developers.shoper.pl | storefront.developers.shoper.pl | github.com/dreamcommerce
