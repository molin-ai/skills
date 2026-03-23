# Molin Site And Marketing Map

This file summarizes the public Molin site structure and the most relevant positioning context discovered in Jarvis.

## Primary Source Files

- `/Users/benedektoth/jarvis/workers/molin-v2/routers/website.router.js`
- `/Users/benedektoth/jarvis/packages/web-components/lib/w-navbar.js`
- `/Users/benedektoth/jarvis/packages/web-components/lib/w-footer.js`
- `/Users/benedektoth/jarvis/workers/molin-v2/services/LandingPageService.js`

## Public Website Routes

Current public routes defined in `website.router.js` include:

- `/`
- `/pricing`
- `/integrations`
- `/partners`
- `/featured`
- `/about`
- `/referral`
- `/solutions/sales`
- `/solutions/support`
- `/solutions/personalization`
- `/personalization-demo`
- `/blog/`
- `/blog/:slug`
- `/demo`
- `/demo/video`
- `/demo/jofogas`
- `/demo/jofogas/listing`

The sitemap route also includes these pages.

## Website Navigation

Top navigation from `w-navbar.js`:

- `Features`
  - `AI Search Concierge` -> `/solutions/sales`
  - `Personalized Shopping` -> `/solutions/personalization`
  - `AI Support Agent` -> `/solutions/support`
- `Resources`
  - `Help Center` -> `https://docs.molin.ai/`
  - `Tutorials` -> Shopify docs page
  - `API` -> `https://docs.molin.ai/apis/`
  - `Blog` -> `/blog`
- `Integrations` -> `/integrations`
- `Ninja AI` -> `https://ninja.new`
- `Pricing` -> `/pricing`

Footer from `w-footer.js` reinforces:

- Product
  - Ninja AI
  - Sales
  - Customer support
  - Personalization
  - Pricing
  - Login
  - Signup
- Integrations
  - Shopify
  - Shoprenter
  - Unas
  - Shoper
- Company
  - About Us
  - References
  - Case studies
  - Refer a shop
- Resources
  - Blog
  - API
  - Video tutorials
  - Help center

## Home Page Content Model

The home page is not fully hardcoded. `LandingPageService` loads CMS data from Contentful:

- hero title and description
- featured testimonial
- integration cards
- featured chatbot/customer cards
- customer testimonials
- topline metrics:
  - `aiSales`
  - `aiConversations`
  - `savedSupportCost`
  - `checkoutEvents`

Use that service when the task is about how the home page is composed or where content comes from.

## Pricing Page In Code

The website has a dedicated `/pricing` page in `website.router.js`.

Structured data in the route currently exposes four Molin plans:

- Free
- Startup
- Growth
- Scale

The JSON-LD in the local repo also lists example feature buckets such as:

- Free: 500 products, personality customization, 5 preset answers, website chat integration, 25 conversations/month
- Startup: 2,000 products, automatic refresh, 20 preset answers, Facebook Messenger integration, 125 conversations/month
- Growth: 10,000 products, file uploads, 50 preset answers, sales tracking, 500 conversations/month
- Scale: 50,000 products, custom actions and API, 100 preset answers, priority support, 1,250 conversations/month

Treat these details as potentially stale unless the task only needs repo-local truth.

## Positioning / Benefits

Strong recurring themes across the site and the prompt:

- AI for e-commerce
- Better product discovery and product search
- Reduced support load
- 24/7 availability
- On-brand answers
- Sales uplift through guided recommendations
- Integrations with major commerce platforms
- Analytics and human handoff/live chat

## Stable Public Links Mentioned In The Prompt

- Main site: `https://molin.ai`
- Featured references: `https://molin.ai/featured`
- YouTube: `https://www.youtube.com/@molinai`
- Help/docs: `https://docs.molin.ai`

## Guidance For Marketing Tasks

- Separate capability claims from commercial claims.
- For feature comparisons or USP work, ground the draft in:
  - product search and discovery
  - support automation
  - personalization
  - platform integrations
  - live chat/human handoff
- If the user asks for exact pricing or promotion copy, verify it from the freshest source available instead of relying on this file alone.
