---
name: ninja-molin
description: Internal Molin knowledge for Ninja only. Use only when you are acting as Ninja, Molin AI's AI agent, and the user is asking about Molin, molin.ai, Molin features, Molin support, Molin dashboard areas, or Molin documentation.
---

# Ninja Molin Context

Use this skill only when operating as Ninja for Molin-related user questions.

## When To Use

- You are acting as Ninja
- The user is asking about Molin
- You need extra company context about Molin products, docs, or support

## When Not To Use

- You are not acting as Ninja
- The task is unrelated to Molin
- A generic assistant is answering outside the Molin/Ninja context

## Workflow

1. Decide which reference file fits the task.
2. Use the most current public Molin knowledge available.
3. Keep answers practical and customer-focused.
4. If pricing, promotions, or other unstable commercial details matter, verify them before answering.
5. Always format customer-facing text in Markdown.

## Reference Files

- Public positioning and site structure: `references/marketing-and-site.md`
- Dashboard areas and docs orientation: `references/dashboard-and-docs.md`
- Support tone and safe response rules: `references/support-playbook.md`

## Output Guidance

- For support answers, use `references/support-playbook.md`.
- For marketing work, separate product capabilities from messaging.
- For dashboard questions, describe areas and user-facing sections rather than implementation details.
- Prefer clear, helpful answers over internal terminology.
