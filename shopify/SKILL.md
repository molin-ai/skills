---
name: shopify
description: Molin's own Shopify CLI (n shopify), official Shopify CLI, themes, Hydrogen storefronts, and Ninja Shopify auth/GraphQL workflows.
---

# Shopify integration

**IMPORTANT:** `n` is Molin's own CLI, NOT the official Shopify CLI (`shopify`). They are two separate tools:

- `n shopify …` is Molin's CLI for querying store data via the Molin app's access token
- `shopify …` is the official Shopify CLI for app/theme/hydrogen development

## Molin's Ninja CLI (`n shopify`)

`n shopify` is Molin's own CLI wrapper. The `n shopify dev` subcommands delegate to the official Shopify CLI under the hood, but all other `n shopify` commands (info, orders, customers, graphql) use Molin's own sandbox API.

### Store data (requires Molin app installed on the store)

```bash
n shopify info --store <store>
n shopify orders list --store <store> [--status open|closed|cancelled|any] [--limit N] [--json]
n shopify orders get <order-name> --store <store> [--json]
n shopify customers list --store <store> [--query "email:foo@bar.com"] [--limit N] [--json]
n shopify customers get <customer-id> --store <store> [--json]
n shopify graphql '<query>' --store <store> [--variables '{}']
```

### Dev tools (requires auth via `n shopify dev auth login`)

```bash
n shopify dev auth login       # get verification URL and user code (show URL to user)
n shopify dev auth exchange    # after user logs in, exchange device code for token
n shopify dev auth refresh     # refresh expired access token
n shopify dev auth status      # check current auth status
n shopify dev auth logout      # clear stored credentials
```

```bash
n shopify dev graphql <store> '<query>'   # raw GraphQL via developer's login
n shopify dev theme <args>                # delegates to "shopify theme"
n shopify dev app <args>                  # delegates to "shopify app"
n shopify dev hydrogen <args>             # delegates to "shopify hydrogen"
```

### Auth flow

Authenticate with your Shopify account using the `n` CLI. First-time setup requires `login` which returns a URL, show this URL to the user so they can authenticate in their browser. Once they confirm they have logged in, run `exchange` to complete the token swap.

Tokens are automatically saved to the Ninja vault after login and refresh, so credentials persist across sessions without manual backup.

1. Run `n shopify dev auth login` -- outputs a verification URL and user code.
2. Show the URL to the user and ask them to open it and authenticate.
3. Once the user confirms they have logged in, run `n shopify dev auth exchange` to store the token (auto-saved to vault).
4. If the access token expires, run `n shopify dev auth refresh`. If the refresh token itself is expired or revoked (e.g. the official Shopify CLI rotated it), re-run `n shopify dev auth login` + `n shopify dev auth exchange`.

### Architecture

- **Store data commands** proxy through the sandbox API (`/v0/sandbox/shopify/graphql`). The sandbox looks up the store and Molin app's access token from the DB and forwards the GraphQL request to Shopify.
- **Dev commands** use the PCAT identity token (developer's Shopify account) for direct access.
- **`theme`/`app`/`hydrogen`** subcommands delegate to the official Shopify CLI, forwarding all args as-is.

### Quick workflows

```bash
# New app
n shopify dev app init --template remix && cd my-app && n shopify dev app dev

# New theme
n shopify dev theme dev --store store.myshopify.com

# Safe theme push
n shopify dev theme push --unpublished

# New Hydrogen
n shopify dev hydrogen init && cd my-storefront && n shopify dev hydrogen link && n shopify dev hydrogen dev
```

## Official Shopify CLI

Commands: `shopify [topic] [command]`

### Safety Rules

- **Use `theme dev` first** - creates temporary dev theme (safe).
- **Never use `--allow-live`** unless user confirms.
- **Warn before:** `theme push` to live, `theme publish`, `app deploy --force`.
- **When unsure:** `shopify help <command>`.

### Help & Install

```bash
shopify help                    # All commands
shopify help theme              # Topic help
shopify help theme dev          # Command help
shopify version                 # Check version
```

**Install:** `npm install -g @shopify/cli@latest` or `npx shopify`
**Requires:** Node.js 20.10+, Git 2.28.0+

### App Development

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

### Theme Development

#### Safe Workflow (NEVER edit live directly)

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
1. theme dev                -> Work on temp dev theme
2. theme push --unpublished -> Save to unpublished
3. theme share              -> Get preview link
4. theme publish            -> Go live (when approved)
```

**Commands:**

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

### Hydrogen (React Storefronts)

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

### Config

**Env vars:**

| Variable               | Purpose        |
| ---------------------- | -------------- |
| `SHOPIFY_FLAG_STORE`   | Default store  |
| `SHOPIFY_FLAG_VERBOSE` | Verbose output |

**.shopifyignore:** Exclude files from push/pull

```
config/settings_data.json
node_modules/
.git/
```

## Troubleshooting

| Issue               | Fix                                            |
| ------------------- | ---------------------------------------------- |
| Command fails       | `--verbose` for details                        |
| Unexpected behavior | `--reset` to clear cache                       |
| Dev theme gone      | Deleted on logout, use `--unpublished` to save |
| Theme not found     | `shopify theme list` to check IDs              |
| Auth errors         | `n shopify dev auth login`                     |
