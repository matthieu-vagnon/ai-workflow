---
name: scalpel
description: Context-first implementation strategy that treats provided files as immutable foundation when the keyword "scalpel" is used with one or more files added as context.
---

# Context-First Strategy

When files are provided as context with the keyword "scalpel", treat them as the authoritative foundation: existing types, classes, interfaces, and structures must be reused as-is.

## Workflow

1. **Analyze** — Carefully read the provided files, understand the architecture and existing patterns.
2. **Plan** — Identify necessary modifications, ask for clarifications if needed.
3. **Implement** — Strictly follow the architecture, SOLID, and KISS principles.

## Strict Rules

| Rule                        | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| **Provided files only**     | Modify ONLY explicitly provided files.                                  |
| **Limited scope changes**   | Write as FEW lines as you can. Keep the codebase clean.                 |
| **No redefinition**         | NEVER recreate/duplicate existing types, classes, or interfaces.        |
| **No new files**            | Ask for explicit confirmation before creating a file.                   |
| **Integration > Expansion** | Compose with existing code rather than introducing parallel structures. |
| **Blocked = Question**      | If constraints block progress, explain why and ask how to proceed.      |
