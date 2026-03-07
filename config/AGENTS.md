# Master Rules

## Project-Specific Rules

Find the project-specific master rules here → `project.md`.

## Before Writing Code

### Skill Analysis (MANDATORY)

CRITICAL: Before acting on ANY request, you MUST first analyze which of your available skills are relevant and should be used. Do NOT jump straight into coding.

1. **Review your available skills** — read the full list of skills at your disposal (MCP tools, built-in skills, custom commands);
2. **Identify which skills match the request** — determine which tools, MCPs, or skills are coherent with the task and would produce the best result;
3. **Plan your approach using those skills** — only then proceed to execute, leveraging the right skills in the right order.

> **Why this matters:** Skipping this step leads to suboptimal output — missed documentation lookups, ignored specialized tools, and reinvented wheels. The 30 seconds spent analyzing skills saves minutes of rework.

### Library Documentation

Before writing or modifying code that uses any external library:

1. **First**, resolve the library with _Context7 MCP_ to get the up-to-date documentation;
2. **Only** if Context7 returns no results or insufficient info, fall back to _Exa MCP_ as a secondary source.

> **Important:** ALWAYS prefer Context7 documentation over training data as the source of truth, especially for critical features (security, billing, authentication, payments, etc.).

## While Writing Code

### Code Conventions

- ALWAYS group all imports in a single block, with no blank lines between them;
- ALWAYS organize the code into blocs with each bloc representing a distinct logic. Each bloc is separated with a line jump (example below).

> **Example:**
>
> ```
> function getUserProfile(userId):
>     user = fetchUser(userId)
>     roles = fetchRoles(userId)
>
>     displayName = user.name or "Anonymous"
>     initials = uppercase(displayName[0:2])
>
>     if user.isAdmin:
>         grantFullAccess(user, roles)
>
>     return buildProfile(user, displayName, initials)
> ```

### Documentation & Logging

- Write TSDoc/docstrings ONLY for **exported** functions, classes, types, and interfaces;
- NEVER add comments on trivial logic (hook, constant declaration, etc.);
- NEVER add logs unless requested;
- ALWAYS comment complex logic (RegEx, etc.);
- Generic code (style variables, UI components, etc.) should ALWAYS be reusable.

## After Writing Code

CRITICAL: ALWAYS check the following after modifying the codebase. Iterate until complete:

- [ ] KISS (Keep It Stupid Simple) principle is applied
- [ ] DRY (Don't Repeat Yourself) principle is applied
- [ ] No logs were added without prior consent
- [ ] Code is properly spaced into logical blocks
