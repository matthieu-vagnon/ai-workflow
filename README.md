```
                                    __                 _
 _ ____ ____ _ __ _ _ _  ___ _ _   / /_ _ __ _ ___ _ _| |_ ___
| '  \ V / _` / _` | ' \/ _ \ ' \ / / _` / _` / -_) ' \  _(_-<
|_|_|_\_/\__,_\__, |_||_\___/_||_/_/\__,_\__, \___|_||_\__/__/
              |___/                      |___/
```

# AI Workflow

Shared configuration and conventions to bootstrap AI coding assistants. One repo, one command — every tool gets the same rules, skills, and MCP servers.

## Supported Tools

| Tool        | Rules              | Skills / Agents                          | Root File   | MCP Config           |
| ----------- | ------------------ | ---------------------------------------- | ----------- | -------------------- |
| Claude Code | `.claude/rules/`   | `.claude/skills/`, `.claude/agents/`     | `CLAUDE.md` | `.mcp.json`          |
| OpenCode    | `.opencode/rules/` | `.opencode/skills/`, `.opencode/agents/` | `AGENTS.md` | `opencode.json`      |
| Cursor      | `.cursor/rules/`   | `.cursor/skills/`, `.cursor/agents/`     | —           | `.cursor/mcp.json`   |
| Codex       | —                  | `.agents/skills/`                        | `AGENTS.md` | `.codex/config.toml` |

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

Updates generic files in `.mvagnon-agents/generic/` to match the latest package version. Project-sensitive files are never overwritten.

### Manage

Add tools, rules, skills and agents to an existing project:

```bash
cd my-project
npx mvagnon-agents manage
```

### API Keys

Manage API keys stored in `~/.config/mvagnon/agents/config.json`. Keys are injected into config files during bootstrap and manage, replacing `{ServiceName}` placeholders. Changing a key only affects future bootstraps — already deployed projects are not updated.

```bash
npx mvagnon-agents keys
```

### Interactive Walkthrough

The script prompts you to:

1. **Select target tools** — one or more (Claude Code, OpenCode, Cursor, Codex)
2. **Pick resources** — rules, skills and agents in a single menu, with category hints
3. **Add to .gitignore?** — yes to ignore tool directories, no to track everything
4. **API keys** — prompted automatically for any missing `{ServiceName}` placeholders

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
│ .mcp.json:  copied
│ .gitignore: not modified

◇ Cursor Setup
│ Rules:      2 linked
│ .cursor/mcp.json: copied
│ .gitignore: not modified

◇ Next Steps
│ 1. Modify the following project-sensitive files to fit your project:
│    - rules/project.md
│ 2. Add rules, skills, agents, MCPs or plugins based on your needs for each tool.

◇ Available Commands
│ npx mvagnon-agents <path>    Bootstrap a project with AI tool configs
│ npx mvagnon-agents manage    Add tools, rules, skills or agents to an existing project
│ npx mvagnon-agents upgrade   Sync generic resources with the latest package version
│ npx mvagnon-agents keys      Manage API keys for future bootstraps (~/.config/mvagnon/agents/)

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
│   ├── project-sensitive/                        # Per-project skills
│   └── generic/
│       └── documentation-writer/                 # Documentation writing skill
├── agents/
│   ├── project-sensitive/                        # Per-project agents
│   └── generic/                                  # Shared agents
├── AGENTS.md                                     # Master rules for all agents
├── claudecode.settings.json                      # Claude Code MCP config
├── opencode.settings.json                        # OpenCode MCP config
├── cursor.mcp.json                               # Cursor MCP config
└── codex.config.toml                             # Codex MCP config (TOML)

bootstrap.mjs                                     # Interactive setup script
lib/
├── sync.mjs                                      # Stable base path for API keys
├── manage.mjs                                    # Manage subcommand
├── apikeys.mjs                                   # API key storage & placeholder replacement
└── keys.mjs                                      # Keys subcommand
```

### How It Works

Files are organized into two categories:

- **project-sensitive** — copied to `.mvagnon-agents/<category>/` and meant to be edited per project. Never overwritten on upgrade.
- **generic** — copied to `.mvagnon-agents/generic/<category>/` and kept in sync with the package. Updated on upgrade.

Tool directories (`.claude/rules/`, `.cursor/rules/`, etc.) contain relative symlinks pointing into `.mvagnon-agents/`. This means all tools share the same source files.

```
.mvagnon-agents/
├── AGENTS.md                                 # Root file
├── rules/
│   └── project.md                            # Project-sensitive (editable)
└── generic/
    ├── rules/
    │   ├── nestjs-hexagonal-architecture.md   # Generic (updated via upgrade)
    │   ├── react-hexagonal-architecture.md
    │   └── fastapi-hexagonal-architecture.md
    └── skills/
        └── documentation-writer/
```

### Configuration Storage

API keys are stored in `~/.config/mvagnon/agents/config.json`. This is the only persistent data stored outside the project — configuration files are read directly from the package at runtime.

## Publishing

Publish is triggered automatically via GitHub Actions on tag push:

```bash
npm version patch   # bumps version, creates commit + tag
git push && git push --tags
```

## Manual Installation

If you prefer not to use the bootstrap script:

1. Copy the `config/` folder contents to your project
2. Rename files according to your target tool (see Supported Tools table)
3. Update `.gitignore` as needed
