```
                                    __                 _
 _ ____ ____ _ __ _ _ _  ___ _ _   / /_ _ __ _ ___ _ _| |_ ___
| '  \ V / _` / _` | ' \/ _ \ ' \ / / _` / _` / -_) ' \  _(_-<
|_|_|_\_/\__,_\__, |_||_\___/_||_/_/\__,_\__, \___|_||_\__/__/
              |___/                      |___/
```

# AI Workflow

Shared configuration and conventions to bootstrap AI coding assistants. One repo, one command — every tool gets the same rules, skills, and MCP servers.

## Global MCP Stack

Every bootstrapped project ships with three MCP servers configured for all supported tools:

| MCP Server | Purpose              | Provider                                                                                                             |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| GitHub     | Version management   | [GitHub Copilot MCP](https://api.githubcopilot.com/mcp)                                                              |
| Context7   | Documentation lookup | [Context7](https://mcp.context7.com/mcp)                                                                             |
| Brave      | Web browsing         | [@modelcontextprotocol/server-brave-search](https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search) |

MCP config templates are generated per tool (see Configuration Storage below). Copy the `.example` file and replace API key placeholders with your actual keys.

## Supported Tools

| Tool        | Rules              | Skills / Agents                           | Root File   | MCP Config           |
| ----------- | ------------------ | ----------------------------------------- | ----------- | -------------------- |
| Claude Code | `.claude/rules/`   | `.claude/skills/` · `.claude/agents/`     | `CLAUDE.md` | `.mcp.json`          |
| OpenCode    | `.opencode/rules/` | `.opencode/skills/` · `.opencode/agents/` | `AGENTS.md` | `opencode.json`      |
| Cursor      | `.cursor/rules/`   | `.cursor/skills/` · `.cursor/agents/`     | —           | `.cursor/mcp.json`   |
| Codex       | —                  | `.agents/skills/`                         | `AGENTS.md` | `.codex/config.toml` |

## Compatibility

| Requirement | Details                   |
| ----------- | ------------------------- |
| Node.js     | >= 18                     |
| macOS       | 12 Monterey and later     |
| Linux       | Any modern distribution   |
| Windows     | Not supported (WSL works) |

## Getting Started

### Bootstrap

```bash
npx mvagnon-agents ../my-project
```

### Upgrade

Run from within a bootstrapped project (requires `.mvagnon-agents/`):

```bash
cd my-project
npx mvagnon-agents upgrade
```

Updates generic and dep-sensitive files in `.mvagnon-agents/` to match the latest package version. Project-sensitive files are never overwritten. A `manifest.json` tracks which items are auto-updatable.

### Manage

Add tools, rules, skills and agents to an existing project:

```bash
cd my-project
npx mvagnon-agents manage
```

### Interactive Walkthrough

The script prompts you to:

1. **Select target tools** — one or more (Claude Code, OpenCode, Cursor, Codex)
2. **Pick resources** — rules, skills and agents in a single menu, with category hints
3. **Add to .gitignore?** — yes to ignore tool directories, no to track everything

```
AI Workflow → /Users/you/projects/my-app

◆ Select target tools
│ [x] Claude Code
│ [x] Cursor
│ [ ] OpenCode
│ [ ] Codex

◆ Pick resources
│ [x] project.md                            (rules · project-sensitive)
│ [x] nestjs-hexagonal-architecture.md      (rules)
│ [ ] react-hexagonal-architecture.md       (rules)
│ [ ] fastapi-hexagonal-architecture.md     (rules)
│ [x] documentation-writer                  (skills)

◆ Add agents configuration to .gitignore?
│ ○ No

◇ Claude Code Setup
│ Rules:      2 linked
│ Skills:     1 linked
│ CLAUDE.md:  linked
│ .mvagnon-agents/.mcp.json.example: copied
│ .gitignore: not modified

◇ Cursor Setup
│ Rules:      2 linked
│ .mvagnon-agents/mcp.json.example: copied
│ .gitignore: not modified

◇ Next Steps
│ 1. Copy config files and replace the API key placeholders:
│    Claude Code: cp .mvagnon-agents/.mcp.json.example .mcp.json
│    Cursor:      cp .mvagnon-agents/mcp.json.example .cursor/mcp.json
│ 2. Modify the following project-sensitive files to fit your project:
│    - rules/project.md
│ 3. Add rules, skills, agents, MCPs or plugins based on your needs for each tool.

◇ Available Commands
│ npx mvagnon-agents manage    Add tools, rules, skills or agents to an existing project
│ npx mvagnon-agents upgrade   Sync generic resources with the latest package version

Done
```

## Project Structure

```
config/
├── rules/
│   ├── project-sensitive/
│   │   └── project.md                           # Per-project rules (editable)
│   └── generic/
│       ├── nestjs-hexagonal-architecture.md      # NestJS hexagonal
│       ├── react-hexagonal-architecture.md       # React hexagonal
│       └── fastapi-hexagonal-architecture.md     # FastAPI hexagonal
├── skills/
│   ├── generic/
│   │   ├── documentation-writer/                 # Documentation writing skill
│   │   └── docs-lookup/                          # External library docs lookup
│   └── dep-sensitive/
│       └── Chrome Dev Tools MCP/
│           └── browser-check/                    # UI verification via Chrome DevTools
├── agents/                                       # Reserved (empty)
├── AGENTS.md                                     # Master rules for all agents
├── claudecode.settings.json                      # Claude Code MCP config
├── opencode.settings.json                        # OpenCode MCP config
├── cursor.mcp.json                               # Cursor MCP config
└── codex.config.toml                             # Codex MCP config (TOML)

bootstrap.mjs                                     # Interactive setup script
lib/
├── manage.mjs                                    # Manage subcommand
└── manifest.mjs                                  # Manifest read/write helpers
```

### How It Works

Files are organized into three types:

- **project-sensitive** — meant to be edited per project. Never overwritten on upgrade.
- **generic** — kept in sync with the package. Updated on upgrade.
- **dep-sensitive** — like generic, but only relevant when a specific dependency is present. Organized as `dep-sensitive/{dependency}/{skill-name}/` in the config directory. Updated on upgrade.

All items are stored flat in `.mvagnon-agents/<category>/`. A `manifest.json` tracks each item's type so the upgrade mechanism knows which items to sync.

Tool directories (`.claude/rules/`, `.cursor/rules/`, etc.) contain relative symlinks pointing into `.mvagnon-agents/`. This means all tools share the same source files.

```
.mvagnon-agents/
├── AGENTS.md                                 # Root file
├── manifest.json                             # Tracks item types for upgrade
├── rules/
│   ├── project.md                            # Project-sensitive (editable)
│   ├── nestjs-hexagonal-architecture.md      # Generic (updated via upgrade)
│   ├── react-hexagonal-architecture.md
│   └── fastapi-hexagonal-architecture.md
└── skills/
    ├── documentation-writer/                 # Generic
    └── docs-lookup/
```

### Configuration Storage

MCP config files are created from `.example` templates in `.mvagnon-agents/`. Copy them to the correct path and replace the API key placeholders with your actual keys. Config files are always gitignored.

## Recommended Claude Code Hooks

Claude Code supports `PostToolUse` hooks that automatically lint and format files after every `Edit` or `Write`. Add the following to your `~/.claude/settings.json` to enable auto-formatting across all projects:

```jsonc
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            // JS/TS: ESLint fix then Prettier (sequential to avoid race conditions)
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.([jt]sx?|mjs|cjs)$\"))' | xargs -I {} sh -c 'npx eslint --fix \"$1\" && npx prettier --write \"$1\"' _ {}",
          },
          {
            // Other files (md, json, css, etc.): Prettier only
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.([jt]sx?|mjs|cjs)$\") | not)' | xargs npx prettier --write --ignore-unknown",
          },
          {
            // Python: Ruff check then format (sequential to avoid race conditions)
            "type": "command",
            "command": "jq -r '.tool_input.file_path | select(test(\"\\\\.py$\"))' | xargs -I {} sh -c 'uvx ruff check --fix \"$1\" && uvx ruff format \"$1\"' _ {}",
          },
        ],
      },
    ],
  },
}
```

> **Why sequential?** Claude Code runs hooks in parallel. Tools that write to the same file (e.g. ESLint + Prettier, or Ruff check + Ruff format) must be chained with `&&` inside a single hook to prevent race conditions.

### Prerequisites

- **Node.js** (for `npx eslint` and `npx prettier`)
- **uv** (for `uvx ruff`) — install via `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Project-level ESLint and Prettier configs (`.eslintrc.*` / `eslint.config.*`, `.prettierrc*`) for JS/TS rules to take effect

## Manual Installation

If you prefer not to use the bootstrap script:

1. Copy the `config/` folder contents to your project
2. Rename files according to your target tool (see Supported Tools table)
3. Replace API key placeholders in config files with your actual keys
4. Update `.gitignore` as needed
