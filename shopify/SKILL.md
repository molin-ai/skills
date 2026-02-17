---
name: shopify
description: Shopify CLI for apps, themes, Hydrogen storefronts. Use for shopify commands and development workflows.
---

# Shopify CLI Reference

Commands: `shopify [topic] [command]`

## Safety Rules

- **Use `theme dev` first** - creates temporary dev theme (safe)
- **Never use `--allow-live`** unless user confirms
- **Warn before:** `theme push` to live, `theme publish`, `app deploy --force`
- **When unsure:** `shopify help <command>`

---

## Help & Install

```bash
shopify help                    # All commands
shopify help theme              # Topic help
shopify help theme dev          # Command help
shopify version                 # Check version
```

**Install:** `npm install -g @shopify/cli@latest` or `npx shopify`
**Requires:** Node.js 20.10+, Git 2.28.0+

---

## Authentication (`n shopify auth`)

Authenticate with Shopify Identity using the `n` CLI. First-time setup requires `login` which returns a URL — show this URL to the user so they can authenticate in their browser. Once they confirm they have logged in, run `exchange` to complete the token swap.

### Commands

```bash
n shopify auth login       # get verification URL and user code (show URL to user)
n shopify auth exchange    # after user has logged in, exchange device code for token
n shopify auth status      # check current auth status (scopes, expiry)
n shopify auth logout      # clear stored credentials
```

### First-time flow

1. Run `n shopify auth login` — outputs a verification URL and user code.
2. Show the URL to the user and ask them to open it and authenticate.
3. Once the user confirms they have logged in, run `n shopify auth exchange` to store the token.

---

## App Development

```bash
shopify app init                          # New app (--template remix|reactRouter|none)
shopify app dev                           # Local dev (-s store, --client-id, --reset)
shopify app build                         # Build
shopify app deploy                        # Deploy (--version, --message, --no-release, -f)
```

**Functions:**

```bash
shopify app function build|run|replay|schema|typegen
```

**Extensions & Config:**

```bash
shopify app generate extension            # New extension
shopify app config link|pull|use          # Config management
shopify app env pull                      # Get env vars
shopify app info                          # Show info
shopify app versions list                 # List deployed versions
shopify app logs                          # Stream logs
shopify app webhook trigger               # Test webhooks
```

---

## Theme Development

### Safe Workflow (NEVER edit live directly)

**Dev themes:** temporary, hidden, auto-delete after 7 days, don't affect live store.

```bash
# SAFE
shopify theme dev --store my-store.myshopify.com       # Creates dev theme
shopify theme push --unpublished                        # New unpublished theme
shopify theme push --theme "Dev Copy"                   # Push to specific theme
shopify theme duplicate                                 # Copy live theme first

# DANGER - avoid unless intentional
shopify theme dev --allow-live                          # Edits live theme!
shopify theme push --allow-live                         # Pushes to live!
shopify theme publish                                   # Makes theme live!
```

**Recommended flow:**

```
1. theme dev           → Work on temp dev theme
2. theme push --unpublished  → Save to unpublished
3. theme share         → Get preview link
4. theme publish       → Go live (when approved)
```

### Commands

```bash
shopify theme init                        # Clone starter theme
shopify theme dev                         # Local dev at 127.0.0.1:9292
shopify theme push                        # Upload (-t theme, -n nodelete, -u unpublished)
shopify theme pull                        # Download
shopify theme list|info|delete|rename     # Manage themes
shopify theme duplicate|share|package     # Copy/share/zip
shopify theme check                       # Linter
shopify theme profile                     # Liquid performance
shopify theme console                     # Liquid REPL
```

**Key flags:** `-s store`, `-t theme`, `-n nodelete`, `--allow-live` (DANGER)

---

## Hydrogen (React Storefronts)

```bash
shopify hydrogen init                     # New storefront
shopify hydrogen dev                      # Local dev (Oxygen emulator)
shopify hydrogen build                    # Production build
shopify hydrogen preview                  # Preview build
shopify hydrogen deploy                   # Deploy to Oxygen (--env, --token)
```

**Link & Env:**

```bash
shopify hydrogen link|unlink|list         # Connect to storefront
shopify hydrogen env list|pull|push       # Environment vars
```

**Code Gen & Auth:**

```bash
shopify hydrogen codegen                  # GraphQL types
shopify hydrogen generate route|routes    # Create routes
shopify hydrogen setup [css|markets|vite] # Setup helpers
shopify hydrogen check|upgrade            # Validate/update
shopify hydrogen login|logout             # Shop authentication
```

---

## Quick Workflows

```bash
# New app
shopify app init --template remix && cd my-app && shopify app dev

# New theme
shopify theme init && cd my-theme && shopify theme dev --store store.myshopify.com

# New Hydrogen
shopify hydrogen init && cd my-storefront && shopify hydrogen link && shopify hydrogen dev

# Deploy app
shopify app build && shopify app deploy --version "1.0.0"

# Safe theme push
shopify theme push --theme "Development" --nodelete
```

---

## Config

**Env vars:**
| Variable | Purpose |
|----------|---------|
| `SHOPIFY_FLAG_STORE` | Default store |
| `SHOPIFY_FLAG_VERBOSE` | Verbose output |
| `SHOPIFY_CLI_NO_ANALYTICS` | Disable analytics (`1`) |

**.shopifyignore:** Exclude files from push/pull

```
config/settings_data.json
node_modules/
.git/
```

---

## Troubleshooting

| Issue               | Fix                                             |
| ------------------- | ----------------------------------------------- |
| Command fails       | `--verbose` for details                         |
| Unexpected behavior | `--reset` to clear cache                        |
| Dev theme gone      | Deleted on logout - use `--unpublished` to save |
| Theme not found     | `shopify theme list` to check IDs               |
| Auth errors         | `shopify auth login`                            |
