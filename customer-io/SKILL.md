---
name: customer-io
description: Customer.io App API for managing newsletters, broadcasts, campaigns, and transactional emails. Use when working with Customer.io email templates, sending test emails, updating newsletter content, or managing email campaigns via CLI/API.
---

# Customer.io App API Reference

## Safety Rules

- **Never send to production segments** without explicit user confirmation
- **GET first** — always pull the latest template before editing
- **Never expose API keys** in outputs
- **Test before sending** — always send a test email before triggering broadcasts
- **API redacts URLs** in GET responses — some `href` and `src` values will show as `[redacted]`. The actual stored values are intact. When building new templates, use known-good URLs.
- **Drag-and-drop templates** — body cannot be updated via API if originally created with the drag-and-drop editor

---

## Authentication

**API Key:** Stored in vault as `CUSTOMERIO_API_KEY`

```bash
# Check for existing key
n vault list | grep CUSTOMERIO_API_KEY

# If not found, ask user. Key is found at:
# Customer.io → Settings → Account Settings → API Credentials → App API Key
n vault set CUSTOMERIO_API_KEY <key>
```

**Base URLs:**

- US: `https://api.customer.io/v1/`
- EU: `https://api-eu.customer.io/v1/`

> ⚠️ If you get `{"errors":[{"detail":"wrong datacenter","status":"301"}]}`, switch to the other base URL.

**Headers:**

```
Authorization: Bearer $CUSTOMERIO_API_KEY
Content-Type: application/json
```

---

## Determine Datacenter

If unsure which datacenter, try US first. If you get a "wrong datacenter" error, use EU.

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --url 'https://api.customer.io/v1/newsletters' \
  --header "Authorization: Bearer $CIO_KEY" | grep -q "wrong datacenter" && echo "Use EU" || echo "Use US"
```

---

## Newsletters (Broadcast Emails)

### List All Newsletters

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/newsletters' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json'
```

**Response fields:** `id`, `name`, `content_ids`, `sent_at`, `created`, `updated`, `type`, `tags`, `subscription_topic_id`

### Search for a Newsletter by Name

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/newsletters' \
  --header "Authorization: Bearer $CIO_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for nl in data.get('newsletters', []):
    if 'SEARCH_TERM' in nl['name'].lower():
        print(f'ID: {nl[\"id\"]}, Name: {nl[\"name\"]}, Content IDs: {nl.get(\"content_ids\", [])}')
"
```

### Get Newsletter Contents

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/newsletters/{newsletter_id}/contents' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json'
```

**Response fields:** `id`, `name`, `body` (HTML), `subject`, `preheader_text`, `from`, `from_id`, `reply_to`, `preprocessor`, `recipient`, `layout`, `type`, `newsletter_id`

### Update Newsletter Content (HTML Body)

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)

# 1. Save new HTML body to file
cat > /tmp/new_body.html << 'EOF'
<!-- your HTML here -->
EOF

# 2. Create JSON payload
python3 -c "
import json
with open('/tmp/new_body.html') as f:
    body = f.read()
with open('/tmp/payload.json', 'w') as f:
    json.dump({'body': body}, f)
"

# 3. PUT to update
curl -s --request PUT \
  --url 'https://api-eu.customer.io/v1/newsletters/{newsletter_id}/contents/{content_id}' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data @/tmp/payload.json
```

---

## Send Test Email

There is **no dedicated test endpoint** for newsletters. Use the transactional send endpoint to deliver the newsletter HTML as a one-off email:

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)

python3 << 'PYEOF'
import json

with open('/tmp/new_body.html') as f:
    body = f.read()

payload = {
    "to": "recipient@example.com",
    "identifiers": {"email": "recipient@example.com"},
    "subject": "[TEST] Your Subject Line",
    "body": body,
    "from": "Sender Name <sender@example.com>"
}

with open('/tmp/send_payload.json', 'w') as f:
    json.dump(payload, f)
PYEOF

curl -s --request POST \
  --url 'https://api-eu.customer.io/v1/send/email' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data @/tmp/send_payload.json
```

**Success response:** `{"delivery_id": "...", "queued_at": 1234567890}`

---

## Campaigns

### List All Campaigns

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/campaigns' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json'
```

**Response fields:** `id`, `name`, `type`, `created`, `updated`, `active`, `state`, `actions`, `tags`, `trigger_segment_ids`

---

## Broadcasts

### List All Broadcasts

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/broadcasts' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json'
```

### Trigger a Broadcast

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request POST \
  --url 'https://api-eu.customer.io/v1/broadcasts/{broadcast_id}/triggers' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "recipients": {
      "segment": {
        "id": 12345
      }
    }
  }'
```

**Rate limit:** 1 request per 10 seconds per broadcast.

---

## Transactional Messages

### List Transactional Messages

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/transactional' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json'
```

### Update Transactional Email Content

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request PUT \
  --url 'https://api-eu.customer.io/v1/transactional/{transactional_id}/content/{content_id}' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"body": "<html>...</html>"}'
```

### Send Transactional Email

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)
curl -s --request POST \
  --url 'https://api-eu.customer.io/v1/send/email' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "transactional_message_id": 7,
    "to": "user@example.com",
    "identifiers": {"email": "user@example.com"},
    "message_data": {
      "first_name": "Test",
      "custom_var": "value"
    }
  }'
```

**Rate limit:** 100 requests per second.

---

## Email Template Patterns

### Typical Workflow: Edit a Newsletter

```bash
CIO_KEY=$(n vault get CUSTOMERIO_API_KEY)

# 1. Find the newsletter
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/newsletters' \
  --header "Authorization: Bearer $CIO_KEY" | python3 -c "
import json, sys
for nl in json.load(sys.stdin).get('newsletters', []):
    print(f'{nl[\"id\"]}: {nl[\"name\"]} (content_ids: {nl.get(\"content_ids\", [])})')
"

# 2. Get current content
curl -s --request GET \
  --url 'https://api-eu.customer.io/v1/newsletters/{id}/contents' \
  --header "Authorization: Bearer $CIO_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
c = data['contents'][0]
print('Subject:', c['subject'])
print('Content ID:', c['id'])
# Save body for editing
with open('/tmp/template_body.html', 'w') as f:
    f.write(c['body'])
print('Body saved to /tmp/template_body.html')
"

# 3. Edit the HTML file
# ... make changes to /tmp/template_body.html ...

# 4. Push update
python3 -c "
import json
with open('/tmp/template_body.html') as f:
    body = f.read()
with open('/tmp/update.json', 'w') as f:
    json.dump({'body': body}, f)
"

curl -s --request PUT \
  --url 'https://api-eu.customer.io/v1/newsletters/{id}/contents/{content_id}' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data @/tmp/update.json

# 5. Send test email
python3 -c "
import json
with open('/tmp/template_body.html') as f:
    body = f.read()
with open('/tmp/test.json', 'w') as f:
    json.dump({
        'to': 'test@example.com',
        'identifiers': {'email': 'test@example.com'},
        'subject': '[TEST] Subject',
        'body': body,
        'from': 'Sender <sender@example.com>'
    }, f)
"

curl -s --request POST \
  --url 'https://api-eu.customer.io/v1/send/email' \
  --header "Authorization: Bearer $CIO_KEY" \
  --header 'Content-Type: application/json' \
  --data @/tmp/test.json
```

### Molin AI Email Template Structure

Standard Molin newsletter HTML structure (550px wide, Helvetica Neue font):

```
<!-- Banner Image (optional) -->
<!-- Greeting: Szia {{customer.first_name}}! (HU) or Hey {{customer.first_name}}, (EN) -->
<!-- Main Content: paragraphs with font-size:16px, color:#343446, line-height:1.6 -->
<!-- CTA Button: #601feb purple, border-radius:14px, arcsize:37%, font-size:14px, height:38px -->
<!-- Divider: 1px solid #e0e0e0 -->
<!-- Social Icons -->
<!-- Copyright: ©{{ "now" | date: "%Y" }} Molin AI -->
<!-- Unsubscribe -->
```

**CTA Button HTML (correct style):**

```html
<table
  class="button_block"
  width="100%"
  border="0"
  cellpadding="10"
  cellspacing="0"
  role="presentation"
  style="mso-table-lspace:0;mso-table-rspace:0"
>
  <tr>
    <td class="pad">
      <div class="alignment" align="center">
        <!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://molin.ai/app/" style="height:38px;width:220px;v-text-anchor:middle;" arcsize="37%" stroke="false" fillcolor="#601feb">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:Arial, sans-serif;font-size:14px">
<![endif]-->
        <a
          class="button"
          href="https://molin.ai/app/"
          target="_blank"
          style="background-color:#601feb;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:14px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:14px;font-weight:700;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;"
          ><span
            style="word-break: break-word; padding-left: 30px; padding-right: 30px; font-size: 14px; display: inline-block; letter-spacing: normal;"
            ><span style="word-break: break-word; line-height: 28px;"
              >Button Text</span
            ></span
          ></a
        >
        <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
      </div>
    </td>
  </tr>
</table>
```

**Molin Social Links (correct URLs):**

- Facebook: `https://www.facebook.com/groups/molinaiofficialen`
- X/Twitter: `https://x.com/molin_ai`
- Instagram: `https://www.instagram.com/molin_app/`
- LinkedIn: `https://www.linkedin.com/company/molin-ai/`

**Social Icon Images (getbee.io):**

- `https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/facebook@2x.png`
- `https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/twitter@2x.png`
- `https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/instagram@2x.png`
- `https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/linkedin@2x.png`

**Molin Logo:**

- `https://files.customer.io/6bbb63a54e6f5691/molin-logo.png` (180px wide)

**Hungarian footer:**

```
Ezt az e-mailt a {{customer.email}} címre küldtük. Ha nem szeretnél több ilyen levelet kapni, leiratkozhatsz itt.
```

**English footer:**

```
The email was sent to {{customer.email}}. To no longer receive these emails, unsubscribe here.
```

**Liquid personalization:**

- Hungarian greeting: `Szia {% if customer.first_name %}{{customer.first_name}}!{% else %}!{% endif %}`
- English greeting: `Hey {% if customer.first_name %}{{customer.first_name}},{% else %},{% endif %}`

---

## Troubleshooting

| Issue                         | Solution                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `wrong datacenter`            | Switch between `api.customer.io` and `api-eu.customer.io`                                       |
| 401 Unauthorized              | Check API key is valid App API key (not Track API key)                                          |
| 404 Not Found                 | Verify newsletter/content IDs exist                                                             |
| 422 Unprocessable             | Check body is valid HTML; ensure template is not drag-and-drop                                  |
| URLs show `[redacted]` in GET | Normal API behavior — stored values are intact. Use known-good URLs when building new templates |
| Images broken in email        | Use absolute URLs; check image hosting is publicly accessible                                   |
| Button too large              | Use `height:38px`, `font-size:14px`, `arcsize:37%`, `border-radius:14px`                        |

---

## Rate Limits

- General API: 10 requests per second
- Broadcast triggers: 1 request per 10 seconds per broadcast
- Transactional sends: 100 requests per second
- Max 10,000 recipients per broadcast trigger call
