---
name: docs-lookup
description: Looks up external library docs. Use before writing code that uses any third-party import or API.
user-invocable: false
---

# Documentation Lookup

## Step 1 — Context7 (primary)

1. Call `mcp__context7__resolve-library-id` with the library name;
2. Call `mcp__context7__get-library-docs` with the resolved ID;
3. If the returned docs answer your question, stop here and use them.

## Step 2 — Brave Search (fallback)

Only if Context7 returned no results, insufficient info, or the question is not about a specific library API:

1. Call `mcp__brave-search__brave_web_search` with a focused query (3-6 words, include library name + version if relevant);
2. Results include LLM-optimized text snippets — use them directly if they answer the question;
3. If more detail is needed, fetch the full page content from promising result URLs;
4. Prefer official sources (docs sites, GitHub repos, RFCs) over blog posts.

## Rules

- NEVER skip Step 1 and go directly to Brave Search;
- NEVER guess function signatures, parameters, or return types from training data when docs are available;
- For critical paths (auth, payments, security), always look up docs even if you feel confident;
- When sources conflict, favor the most recent one and flag the discrepancy.
