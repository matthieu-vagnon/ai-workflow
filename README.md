# AI Workflow

Configuration and conventions to optimize AI coding assistants on TypeScript/React projects.

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

1. **Select technologies**: Choose React and/or TypeScript to filter relevant rules
2. **Select architecture**: Optional (e.g., Hexagonal)
3. **Choose mode**: Symlinks (recommended) or copy files
4. **Gitignore handling**: Add entries to ignore or create exceptions
5. **Select target tools**: One or more tools (Claude Code, OpenCode, Cursor, Codex)

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
│   ├── project.md                        # Generic project rules (always copied)
│   └── react-hexagonal-architecture.md   # Hexagonal architecture for React
├── skills/
│   └── readme-writing/                   # README generation
├── agents/                               # Custom agents (optional)
├── AGENTS.md                             # Master rules for all agents
├── claudecode.settings.json              # Claude Code MCP config
├── opencode.settings.json                # OpenCode MCP config
├── cursor.mcp.json                       # Cursor MCP config
└── codex.config.toml                     # Codex MCP config (TOML)

bootstrap.mjs                             # Node.js setup script
```

## Supported Tools

| Tool        | Rules              | Skills/Agents                            | Root File   | Config File          |
| ----------- | ------------------ | ---------------------------------------- | ----------- | -------------------- |
| Claude Code | `.claude/rules/`   | `.claude/skills/`, `.claude/agents/`     | `CLAUDE.md` | `.mcp.json`          |
| OpenCode    | `.opencode/rules/` | `.opencode/skills/`, `.opencode/agents/` | `AGENTS.md` | `opencode.json`      |
| Cursor      | `.cursor/rules/`   | —                                        | —           | `.cursor/mcp.json`   |
| Codex       | —                  | —                                        | `AGENTS.md` | `.codex/config.toml` |

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
