---
name: molin
description: Molin AI company skill for support, product/pricing questions, marketing copy, dashboard navigation, and Mintlify docs. Use when the user mentions Molin, molin.ai, Molin plans/features/benefits, Molin dashboard menus, or Molin support policies.
---

# Molin AI

Use this skill for Molin-specific work.

## When To Use

- Molin support or sales answers
- Molin pricing, plans, features, benefits, or positioning
- Molin marketing copy, landing page analysis, or website IA
- Molin dashboard navigation, route mapping, or menu discovery
- Molin docs, APIs, Mintlify structure, or `llms.txt`

## Workflow

1. Decide which reference file matches the task.
2. Prefer the Jarvis repo as the source of truth for current Molin product structure.
3. Prefer current canonical `/app/...` routes. Treat older `/app/shop-ai/...` paths as compatibility redirects unless the task specifically asks about legacy URLs.
4. If exact pricing or public-site copy must be current, verify against the freshest available source before answering. If you only have local repo context, say that explicitly.
5. Always format customer-facing text in Markdown.

## Reference Files

- Public site, landing pages, pricing, and positioning: `references/marketing-and-site.md`
- Dashboard routes, menus, settings, Mintlify docs, and `llms.txt`: `references/dashboard-and-docs.md`
- Support assistant rules and canned Molin guidance: `references/support-playbook.md`

## Best Source Files In Jarvis

Read these first when you need primary sources:

- `workers/molin-v2/routers/website.router.js`
- `workers/molin-v2/routes.js`
- `workers/molin-v2/pages/settings.html.js`
- `workers/molin-v2/middleware.js`
- `workers/molin-v2/routers/llms-txt.router.js`
- `workers/molin-v2/services/LandingPageService.js`
- `packages/web-components/lib/m-dashboard-sidebar.js`
- `packages/web-components/lib/m-settings-sidebar.js`
- `packages/web-components/lib/w-navbar.js`
- `packages/web-components/lib/w-footer.js`
- `mintlify/docs.json`

## Output Guidance

- For support answers, use `references/support-playbook.md`.
- For internal product questions, cite the relevant Jarvis paths.
- For dashboard/menu questions, distinguish between:
  - dashboard sidebar
  - settings sidebar
  - public website navigation
- For marketing work, separate:
  - factual product capabilities
  - positioning/benefits
  - unstable commercial details such as pricing or promotions
