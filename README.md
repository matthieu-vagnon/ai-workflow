```
                                    __                 _
 _ ____ ____ _ __ _ _ _  ___ _ _   / /_ _ __ _ ___ _ _| |_ ___
| '  \ V / _` / _` | ' \/ _ \ ' \ / / _` / _` / -_) ' \  _(_-<
|_|_|_\_/\__,_\__, |_||_\___/_||_/_/\__,_\__, \___|_||_\__/__/
              |___/                      |___/
```

# AI Workflow

Shared configuration and conventions to bootstrap AI coding assistants on TypeScript/React projects. One repo, one command — every tool gets the same rules, skills, and MCP servers.

## Supported Tools

| Tool        | Rules              | Skills / Agents                          | Root File   | MCP Config           |
| ----------- | ------------------ | ---------------------------------------- | ----------- | -------------------- |
| Claude Code | `.claude/rules/`   | `.claude/skills/`, `.claude/agents/`     | `CLAUDE.md` | `.mcp.json`          |
| OpenCode    | `.opencode/rules/` | `.opencode/skills/`, `.opencode/agents/` | `AGENTS.md` | `opencode.json`      |
| Cursor      | `.cursor/rules/`   | `.cursor/skills/`, `.cursor/agents/`     | —           | `.cursor/mcp.json`   |
| Codex       | —                  | `.agents/skills/`                        | `AGENTS.md` | `.codex/config.toml` |

## Tech Stack Coverage

| Category | Technologies                                              |
| -------- | --------------------------------------------------------- |
| Frontend | React, Next.js, Vite, TypeScript, Tailwind CSS, ShadCN UI |
| Backend  | Node.js, Fastify, Express, NestJS, Supabase               |
| State    | Zustand, TanStack Query, React Context                    |
| Testing  | Vitest, Jest, React Testing Library                       |
| Tooling  | ESLint, Prettier, pnpm, Docker                            |

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm or npm

### Installation

```bash
pnpm install
```

### Usage

```bash
# Run the bootstrap script with target path
pnpm run bootstrap ../my-project

# Or directly with node
node bootstrap.mjs ~/projects/my-app
```

### Interactive Walkthrough

The script prompts you to:

1. **Select technologies** — filter rules by stack (React, TypeScript)
2. **Select architecture** — optional (e.g. Hexagonal)
3. **Choose mode** — symlinks (recommended) or copy files
4. **Select target tools** — one or more (Claude Code, OpenCode, Cursor, Codex)

```
AI Workflow → /Users/you/projects/my-app

◆ Select technologies
│ [ ] React - Components, hooks, patterns
│ [x] TypeScript - Conventions, testing

◆ Select custom architecture
│ ● None

◆ Use symlinks? Yes

◆ Select target tools
│ [x] Claude Code
│ [x] Cursor
│ [ ] OpenCode
│ [ ] Codex

◇ Claude Code Setup
│ Rules:      2 linked
│ Skills:     1 linked
│ Agents:     0 linked
│ CLAUDE.md:  linked
│ .mcp.json:  copied
│ .gitignore: entries added

◇ Cursor Setup
│ Rules:      2 linked
│ .cursor/mcp.json: copied
│ .gitignore: entries added

Done
```

## Project Structure

```
config/
├── rules/
│   ├── project.md                        # Generic project rules (always included)
│   └── react-hexagonal-architecture.md   # Hexagonal architecture for React
├── skills/
│   └── readme-writing/                   # README generation skill
├── agents/                               # Custom agents (optional)
├── AGENTS.md                             # Master rules for all agents
├── claudecode.settings.json              # Claude Code MCP config
├── opencode.settings.json                # OpenCode MCP config
├── cursor.mcp.json                       # Cursor MCP config
└── codex.config.toml                     # Codex MCP config (TOML)

bootstrap.mjs                             # Interactive setup script
```

## Rule Filtering

Items without a technology or architecture prefix are considered generic and always included.

| Selection    | Rules Included                         |
| ------------ | -------------------------------------- |
| None         | Generic rules only (`project.md`)      |
| React        | Generic + `react-*.md`                 |
| TypeScript   | Generic + `ts-*.md`                    |
| Hexagonal    | Generic + items containing `hexagonal` |
| React + Both | Generic + `react-*.md` + `ts-*.md`     |

## Symlinks vs Copy

| Mode     | Pros                                | Cons                          |
| -------- | ----------------------------------- | ----------------------------- |
| Symlinks | Centralized updates, no duplication | Requires source repo presence |
| Copy     | Self-contained, portable            | Manual updates needed         |

Items listed in `COPIED_RULES`, `COPIED_SKILLS`, or `COPIED_AGENTS` are always copied (never symlinked) to allow per-project customization.

## Manual Installation

If you prefer not to use the bootstrap script:

1. Copy the `config/` folder contents to your project
2. Rename files according to your target tool (see Supported Tools table)
3. Update `.gitignore` as needed
