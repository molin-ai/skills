---
name: hunter-io
description: Use the Hunter.io API to find and verify professional email addresses.
---

# Hunter.io

Find and verify professional email addresses.

## Authentication

1. Check vault for existing key: `n vault list | grep HUNTER_API_KEY`
2. If not found, ask the **user** to create an API key at: https://hunter.io/api-keys (requires login)
3. Once user provides the key, save to vault: `n vault set HUNTER_API_KEY <API_KEY>`

**Note:** Ninja cannot create the API key - the user must log into their Hunter.io account and generate it.

## API Endpoints

Base URL: `https://api.hunter.io/v2`

### Domain Search

Find all emails at a company domain:

```sh
n vault exec --with HUNTER_API_KEY -- bash -c \
  'curl -s "https://api.hunter.io/v2/domain-search?domain=example.com&api_key=$HUNTER_API_KEY"'
```

### Email Finder

Find specific person's email:

```sh
n vault exec --with HUNTER_API_KEY -- bash -c \
  'curl -s "https://api.hunter.io/v2/email-finder?domain=example.com&first_name=John&last_name=Doe&api_key=$HUNTER_API_KEY"'
```

### Email Verification

Verify if email is valid/deliverable:

```sh
n vault exec --with HUNTER_API_KEY -- bash -c \
  'curl -s "https://api.hunter.io/v2/email-verifier?email=john@example.com&api_key=$HUNTER_API_KEY"'
```

### Company Enrichment

Get company info from domain:

```sh
n vault exec --with HUNTER_API_KEY -- bash -c \
  'curl -s "https://api.hunter.io/v2/companies/find?domain=example.com&api_key=$HUNTER_API_KEY"'
```

### Person Enrichment

Get person info from email:

```sh
n vault exec --with HUNTER_API_KEY -- bash -c \
  'curl -s "https://api.hunter.io/v2/people/find?email=john@example.com&api_key=$HUNTER_API_KEY"'
```

## Key Response Fields

- `status`: "valid", "invalid", "accept_all", "webmail", "disposable"
- `score`: 0-100 confidence score
- `email`: the found/verified email
- `position`: job title
- `linkedin_url`: LinkedIn profile

## Lead Finding Strategy

If Hunter returns no emails for a domain:

1. **Search for people online** - Use web search to find team members:
   - Search: `"Company Name" CEO OR founder OR "head of" OR director OR manager`
   - Look for case studies, press releases, interviews, about pages
   - Do NOT open LinkedIn directly (requires login) - use search snippets instead

2. **Use Email Finder with names** - Once you have names, use the email-finder endpoint:

   ```sh
   n vault exec --with HUNTER_API_KEY -- bash -c \
     'curl -s "https://api.hunter.io/v2/email-finder?domain=example.com&first_name=John&last_name=Doe&api_key=$HUNTER_API_KEY"'
   ```

3. **Try alternative company domains** - Companies often use different domains for email:
   - Check for shortened domains (e.g., tayloroldbondst.co.uk → tobs.co.uk)
   - Look for .com vs .co.uk variants
   - Check contact pages for actual email domain

4. **Verify before sending** - Always verify found emails with email-verifier endpoint

## Tips

- Website domain and email domain can differ (e.g., tayloroldbondst.co.uk uses tobs.co.uk for email)
- Always verify emails before sending with email-verifier endpoint
- Score 90+ is reliable for outreach
