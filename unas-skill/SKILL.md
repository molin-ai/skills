---
name: unas-skill
description: UNAS.hu Hungarian e-commerce platform - XML API, theme customization. Use for UNAS webshops, API calls, design changes.
allowed-tools: Bash, Read, Glob, Grep, Write, Edit
---

# UNAS.hu API Reference

## Safety Rules
- **Confirm before modifying production** - orders, products, stock
- **GET first** - understand data before set/delete operations
- **Never expose tokens** in outputs
- **Requires:** PREMIUM or VIP subscription
- Docs: unas.hu/tudastar/api

---

## Authentication

**Base URL:** `https://api.unas.eu/shop/`
**Format:** XML (request & response)
**Method:** POST
**Protocol:** TLS 1.2/1.3

### Option 1: API Key (Premium) - Recommended

```bash
# Get credentials: Admin → Beállítások → Külső kapcsolatok → API kapcsolat
# Generate API key with required permissions

# Login request
curl -X POST "https://api.unas.eu/shop/login" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<Params>
  <ApiKey>YOUR_API_KEY</ApiKey>
</Params>'

# Response contains Token, use in subsequent requests
```

### Option 2: Legacy Auth

```bash
curl -X POST "https://api.unas.eu/shop/login" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<Params>
  <Username>your-username</Username>
  <PasswordCrypt>your-password</PasswordCrypt>
  <ShopId>your-shop-id</ShopId>
  <AuthCode>your-auth-code</AuthCode>
</Params>'
```

### Using Token

```bash
# Token returned in login response, use in Authorization header
curl -X POST "https://api.unas.eu/shop/getProduct" \
  -H "Content-Type: application/xml" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '<Params>...</Params>'
```

**Login response includes:** Token, expiry time, shop ID, subscription package, permissions (accessible endpoints).

**Note:** Token has expiry time - reuse until expired, no need to login before every call.

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `login` | Get auth token |
| `getProduct` / `setProduct` | Products (query/modify) |
| `getProductDB` / `setProductDB` | Product database |
| `getOrder` / `setOrder` | Orders |
| `getStock` / `setStock` | Inventory |
| `getCategory` / `setCategory` | Categories |
| `getCustomer` / `setCustomer` | Customers |
| `getStorage` / `setStorage` | Warehouses |
| `getNewsletter` / `setNewsletter` | Newsletter subscribers |
| `getProductParameter` / `setProductParameter` | Product attributes |
| `getDeliveryPoint` / `setDeliveryPoint` | Delivery/pickup points |
| `getPackageOffer` / `setPackageOffer` | Package offers |
| `getProductReview` / `setProductReview` | Product reviews |
| `checkCustomer` | Validate customer |

**URL pattern:** `https://api.unas.eu/shop/{endpoint}`

---

## Request/Response Format

**Request (XML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Params>
  <Id>12345</Id>
  <!-- endpoint-specific params -->
</Params>
```

**Response (Success - HTTP 200):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Products>
  <Product>
    <Id>12345</Id>
    <Name>Product Name</Name>
    <Price>1990</Price>
    <!-- ... -->
  </Product>
</Products>
```

**Response (Error - HTTP 400):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Error>Error message</Error>
```

---

## Common Operations

```bash
# Get products
curl -X POST "https://api.unas.eu/shop/getProduct" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><Params><Limit>100</Limit></Params>'

# Get orders
curl -X POST "https://api.unas.eu/shop/getOrder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><Params><Status>new</Status></Params>'

# Update stock
curl -X POST "https://api.unas.eu/shop/setStock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><Params><Product><Sku>ABC123</Sku><Stock>50</Stock></Product></Params>'

# Update order status
curl -X POST "https://api.unas.eu/shop/setOrder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><Params><Order><Id>12345</Id><Status>shipped</Status></Order></Params>'

# Create/update product
curl -X POST "https://api.unas.eu/shop/setProduct" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><Params><Product><Sku>NEW123</Sku><Name>New Product</Name><Price>2990</Price><Stock>100</Stock></Product></Params>'
```

---

## Rate Limits

| Operation | PREMIUM | VIP |
|-----------|---------|-----|
| setProduct (≤100 items) | 1000/hr | 3000/hr |
| setProduct (>100 items) | 30/hr | 90/hr |

---

## Theme Development

### Template Engine - TWIG

UNAS uses TWIG templating with **two-level rendering**:
- **First pass:** `{% %}` and `{{ }}` markers (standard TWIG)
- **Second pass:** `[% %]` and `[[ ]]` markers (UNAS-specific)

### Template Structure

```
main.html              # Main layout (loaded on all pages)
main_[page].html       # Page-specific override (e.g., main_product_details.html)
main.cfg               # Global configuration
content_[name]_[x].html # Page content templates
box_[name]_[x].html    # Box/widget templates
```

### Main Template Variables

```twig
[[ body_start ]]    {# Page start elements #}
[[ title ]]         {# Page title #}
[[ breadcrumb ]]    {# Breadcrumb navigation #}
[[ content ]]       {# Main page content (loads content_*.html) #}
[[ body_end ]]      {# End elements, integrations #}
```

### Customization Options

**Via Admin Panel:**
```
Admin → Megjelenés → Kinézet testreszabása
```

- **Colors:** Edit primary, secondary, text colors (modern templates)
- **Custom CSS:** Add CSS code → Save → Activate
- **HTML modules:** Custom HTML blocks
- **Triton template:** Visual editor, no coding

### Safe Theme Workflow

```
1. Only copy templates you need to customize (uncopied get updates)
2. Test CSS in browser devtools first
3. Create main_[page].html for page-specific layouts
4. Check mobile responsiveness
```

### CSS Example

```css
/* Admin → Kinézet testreszabása → Egyedi CSS */
.btn-primary { background-color: #your-brand-color; }
.product-price { font-size: 1.2em; color: #e74c3c; }
```

**Docs:** unas.hu/tudastar/design

---

## App/Integration Development

### Getting Started

1. **Contact UNAS:** Email app@unas.hu with your app description
2. **Describe:** Purpose, target admin menu location, required API endpoints
3. **Get approved:** UNAS reviews and grants API access
4. **Develop:** Use demo integration as reference (GitHub)
5. **Deploy:** Fixed IP addresses required for security

### Integration Types

| Type | Description | Recommended |
|------|-------------|-------------|
| **Embedded** | App UI inside UNAS admin panel | ✅ Yes |
| **Redirected** | Opens external URL | ❌ No |

### How It Works

```
1. User installs your app in UNAS admin
2. API key auto-generated with agreed permissions
3. Your app accesses shop data via API
4. App UI displayed inside admin panel (embedded)
```

### Requirements

- **Subscription:** PREMIUM or VIP (for custom admin integrations)
- **Fixed IP:** Only whitelisted IPv4 addresses accepted
- **API endpoints:** Only approved endpoints accessible
- **Demo:** Available on GitHub as reference

### Partner Benefits

- Access to 7,500+ UNAS webshops
- Native integration in admin panel
- Automatic API key generation for users
- Listed in UNAS integrations catalog

**Contact:** app@unas.hu
**Docs:** unas.hu/tudastar/integracio

---

## Libraries

```bash
# PHP/Laravel
composer require szunisoft/laravel-unas

# Go
go get github.com/perryd01/unaswrappergo

# PHP (Packagist)
composer require kerekit/unas-api

# Yii2
composer require vadgab/yii2-unas-api
```

**Laravel example:**
```php
$client = app('unas.client');
$client->getProducts()->chunk(function ($products) {
    // process products
}, 50);
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| HTTP 400 | Check XML format, required fields |
| Invalid token | Re-authenticate, token expired |
| Rate limited | Wait, reduce batch size |
| No access | Check subscription (PREMIUM/VIP required) |

**Enable API:** Admin → Beállítások → Külső kapcsolatok → API kapcsolat → Enable

**Docs:** unas.hu/tudastar/api
