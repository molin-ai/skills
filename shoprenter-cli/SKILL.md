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

See [references/tools.md](references/tools.md) for the complete list of 90+ tools with their parameters and required OAuth scopes.
