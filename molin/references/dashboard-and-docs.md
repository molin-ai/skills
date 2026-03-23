# Molin Dashboard And Docs Map

This file maps the current app structure in Jarvis and the Mintlify docs layout.

## Primary Source Files

- `/Users/benedektoth/jarvis/workers/molin-v2/routes.js`
- `/Users/benedektoth/jarvis/packages/web-components/lib/m-dashboard-sidebar.js`
- `/Users/benedektoth/jarvis/packages/web-components/lib/m-settings-sidebar.js`
- `/Users/benedektoth/jarvis/workers/molin-v2/pages/settings.html.js`
- `/Users/benedektoth/jarvis/workers/molin-v2/middleware.js`
- `/Users/benedektoth/jarvis/mintlify/docs.json`
- `/Users/benedektoth/jarvis/workers/molin-v2/routers/llms-txt.router.js`

## Canonical App Route Pattern

Current source routes use canonical `/app/...` paths.

Important legacy redirects still exist:

- `/app/shop-ai/conversations` -> `/app/inbox`
- `/app/shop-ai/personality` -> `/app/personality`
- `/app/shop-ai/design` -> `/app/design`
- `/app/shop-ai/publish` -> `/app/publish`
- `/app/shop-ai/faqs` -> `/app/faqs`
- `/app/shop-ai/sources` -> `/app/products`
- `/app/shop-ai/reports` -> `/app/reports`
- `/app/ai-actions` -> `/app/actions`
- `/settings/members` -> `/app/settings/members`

When documenting the current product, prefer the short routes.

## Main Dashboard Sidebar

Source: `packages/web-components/lib/m-dashboard-sidebar.js`

Visible to all signed-in users:

- `Inbox` -> `/app/inbox`
- `Sidekick` -> `/app/sidekick`
- bottom links:
  - `Refer a friend for $100` -> `/app/referrals`
  - `Help` -> drawer trigger
  - account menu

Visible to `admin` and `team-admin`:

- `Analytics` -> `/app/reports`
- `AI Knowledge`
  - `Products` -> `/app/products`
  - `Documents` -> `/app/documents`
  - `FAQs` -> `/app/faqs`
- `Channels`
  - `Chatbot`
    - `Personality` -> `/app/personality`
    - `Design` -> `/app/design`
    - `Actions` -> `/app/actions`
    - `Publish` -> `/app/publish`
  - `Social media` -> `/app/integrations`
  - `Ninja AI` -> external `https://ninja.new`

Internal-only email allowlist users also see:

- `Admin` -> `/admin`

## Settings Sidebar

Source: `packages/web-components/lib/m-settings-sidebar.js`

For admin/team-admin:

- `General` -> `/app/settings`
- `Profile` -> `/app/account/profile`
- `Chatbots` -> `/app/settings/chatbots`
- `Members` -> `/app/settings/members`
- `Billing` -> `/app/settings/billing`
- `Plans` -> `/app/plans`
- `Usage` -> `/app/settings/usage`

Team agents appear to only get:

- `Profile` -> `/app/account/profile`

## Important App Route Mounts

Source: `workers/molin-v2/routes.js`

Main dashboard/product pages:

- `/app/inbox`
- `/app/design`
- `/app/faqs`
- `/app/personality`
- `/app/publish`
- `/app/reports`
- `/app/documents`
- `/app/products`
- `/app/actions`
- `/app/custom-actions`
- `/app/integrations`
- `/app/referrals`
- `/app/account`
- `/app/billing`
- `/app/settings`
- `/app/chat`
- `/app/sidekick`
- `/app/plans`

## Dashboard Layout Wiring

Source: `workers/molin-v2/middleware.js`

`dashboardLayoutM` wraps pages with:

- user context
- plan context
- widget context
- help drawer layout
- dashboard layout
- dashboard sidebar
- dashboard navbar

It also conditionally shows a Ninja promo banner for some platforms and hides it on:

- `/app/personality`
- `/app/design`
- `/app/actions`
- `/app/publish`
- `/app/integrations`

## Mintlify Docs Structure

Source: `mintlify/docs.json`

Current top-level tabs:

- `Home`
- `API Reference`
- `Tracking`
- `System Status`
- `Legal`

Important docs groups under `Home`:

- Get Started
- Platform integrations
  - Shopify
  - Shoper
  - Shoprenter
  - Unas
  - WooCommerce
- Custom feeds
  - Google Shopping feed
  - Arukereso / Compari feed
  - Prefixbox feed
  - AI sitemap scraper
- Migrating to Molin
- Mobile
- General

Important docs groups under `API Reference`:

- Get Started
- APIs
  - Product sync with Schema.org
  - Custom actions
- JavaScript API
  - Personalization API
  - Show / hide widget

Tracking tab includes:

- marketing tracking
- UTM
- JavaScript events
- integrations for Google Analytics, Klaviyo, Microsoft Clarity

## llms.txt

Source: `workers/molin-v2/routers/llms-txt.router.js`

`/llms.txt` summarizes:

- overview
- features
- pricing and plans
- integrations
- company information
- customer engagement
- technical resources
- blog and insights

Use this file as a quick external-facing sitemap for LLM-oriented discovery, not as the most precise source of truth.

## Guidance For Product Questions

- If the question is “where is this menu?”, use the sidebar component files.
- If the question is “what route serves this page?”, use `workers/molin-v2/routes.js`.
- If the question is “is this current or legacy?”, check whether the route is mounted directly or only redirected.
- If the question is about docs information architecture, use `mintlify/docs.json`.
