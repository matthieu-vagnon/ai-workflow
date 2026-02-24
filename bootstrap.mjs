#!/usr/bin/env node

import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =============================================================================
// CONFIGURATION
// =============================================================================

// Technologies filter items by prefix (e.g., "react-*" matches "react-components")
const TECHNOLOGIES = [
  { value: "react", label: "React", hint: "Components, hooks, patterns" },
  { value: "ts", label: "TypeScript", hint: "Conventions, testing" },
];

// Architectures filter items by substring match
const ARCHITECTURES = [
  { value: "none", label: "None", hint: "No custom architecture" },
  { value: "hexagonal", label: "Hexagonal", hint: "Ports & adapters pattern" },
];

// Items always copied (never symlinked) to allow per-project customization
const COPIED_RULES = ["project"];
const COPIED_SKILLS = [];
const COPIED_AGENTS = [];

// Intermediate directory in the target project for per-project customizable resources
const INTERMEDIATE_DIR = ".mvagnon/agents";

// Tool definitions: directory structure, root files, config files, gitignore
const TOOLS = {
  claudecode: {
    value: "claudecode",
    label: "Claude Code",
    hint: "Anthropic's CLI for Claude",
    paths: {
      rules: ".claude/rules",
      skills: ".claude/skills",
      agents: ".claude/agents",
    },
    rootFiles: { "AGENTS.md": "CLAUDE.md" },
    configFiles: { "claudecode.settings.json": ".mcp.json" },
    gitignoreEntries: [".claude", "CLAUDE.md", ".mcp.json"],
  },

  opencode: {
    value: "opencode",
    label: "OpenCode",
    hint: "Open-source AI coding assistant",
    paths: {
      rules: ".opencode/rules",
      skills: ".opencode/skills",
      agents: ".opencode/agents",
    },
    rootFiles: { "AGENTS.md": "AGENTS.md" },
    configFiles: { "opencode.settings.json": "opencode.json" },
    gitignoreEntries: [".opencode", "AGENTS.md", "opencode.json"],
  },

  cursor: {
    value: "cursor",
    label: "Cursor",
    hint: "AI-powered code editor",
    paths: {
      rules: ".cursor/rules",
      skills: ".cursor/skills",
      agents: ".cursor/agents",
    },
    rootFiles: {},
    configFiles: { "cursor.mcp.json": ".cursor/mcp.json" },
    gitignoreEntries: [".cursor"],
  },

  codex: {
    value: "codex",
    label: "Codex",
    hint: "OpenAI's coding agent CLI",
    paths: {
      skills: ".agents/skills",
    },
    rootFiles: { "AGENTS.md": "AGENTS.md" },
    configFiles: { "codex.config.toml": ".codex/config.toml" },
    gitignoreEntries: [".codex", ".agents", "AGENTS.md"],
  },
};

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const targetArg = process.argv[2];

  if (!targetArg) {
    console.error("Usage: ./bootstrap.sh <target-path>");
    console.error("Example: ./bootstrap.sh ../my-project");
    process.exit(1);
  }

  const targetPath = resolvePath(targetArg);

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Directory not found: ${targetPath}`);
    process.exit(1);
  }

  if (!fs.statSync(targetPath).isDirectory()) {
    console.error(`Error: Path must be a directory: ${targetPath}`);
    process.exit(1);
  }

  console.clear();

  const banner = [
    "                                    __                 _      ",
    " _ ____ ____ _ __ _ _ _  ___ _ _   / /_ _ __ _ ___ _ _| |_ ___",
    "| '  \\ V / _` / _` | ' \\/ _ \\ ' \\ / / _` / _` / -_) ' \\  _(_-<",
    "|_|_|_\\_/\\__,_\\__, |_||_\\___/_||_/_/\\__,_\\__, \\___|_||_\\__/__/",
    "              |___/                      |___/                 ",
  ];
  console.log("\x1b[36m" + banner.join("\n") + "\x1b[0m\n");

  p.intro(`AI Workflow → ${targetPath}`);

  const config = await p.group(
    {
      techs: () =>
        p.multiselect({
          message: "Select technologies",
          options: TECHNOLOGIES,
          required: false,
        }),

      archs: () =>
        p.select({
          message: "Select custom architecture",
          options: ARCHITECTURES,
          required: false,
        }),

      useSymlinks: () =>
        p.confirm({
          message:
            "Use symlinks? (yes: `.gitignore` updated, no: config versioned)",
          initialValue: true,
        }),

      tools: () =>
        p.multiselect({
          message: "Select target tools",
          options: Object.values(TOOLS).map((t) => ({
            value: t.value,
            label: t.label,
            hint: t.hint,
          })),
          required: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled");
        process.exit(0);
      },
    },
  );

  const selectedTechs = config.techs || [];
  const selectedArchs = config.archs ? [config.archs] : [];
  const useSymlinks = config.useSymlinks;
  const selectedTools = config.tools.map((key) => TOOLS[key]);
  const s = p.spinner();
  const safeCopy = (src, tgt) =>
    copyWithConfirm(src, tgt, { spinner: s, projectRoot: targetPath });
  const linkOrCopy = useSymlinks
    ? async (src, tgt) => createSymlink(src, tgt)
    : safeCopy;

  s.start(useSymlinks ? "Creating symlinks" : "Copying files");

  const mode = useSymlinks ? "linked" : "copied";
  const summaryLines = [];
  const processedIntermediateFiles = new Set();

  for (const tool of selectedTools) {
    const stats = { rules: 0, skills: 0, agents: 0 };
    const { paths } = tool;

    for (const dir of Object.values(paths)) {
      fs.mkdirSync(path.join(targetPath, dir), { recursive: true });
    }

    if (paths.rules) {
      stats.rules = await linkMatchingItems(
        path.join(__dirname, "config", "rules"),
        path.join(targetPath, paths.rules),
        selectedTechs,
        selectedArchs,
        linkOrCopy,
        {
          filterExtension: ".md",
          copiedItems: COPIED_RULES,
          intermediateDir: path.join(targetPath, INTERMEDIATE_DIR, "rules"),
          processedIntermediateFiles,
          safeCopy,
        },
      );
    }

    if (paths.skills) {
      stats.skills = await linkMatchingItems(
        path.join(__dirname, "config", "skills"),
        path.join(targetPath, paths.skills),
        selectedTechs,
        selectedArchs,
        linkOrCopy,
        {
          directoriesOnly: true,
          copiedItems: COPIED_SKILLS,
          intermediateDir: path.join(targetPath, INTERMEDIATE_DIR, "skills"),
          processedIntermediateFiles,
          safeCopy,
        },
      );
    }

    if (paths.agents) {
      stats.agents = await linkMatchingItems(
        path.join(__dirname, "config", "agents"),
        path.join(targetPath, paths.agents),
        selectedTechs,
        selectedArchs,
        linkOrCopy,
        {
          directoriesOnly: true,
          copiedItems: COPIED_AGENTS,
          intermediateDir: path.join(targetPath, INTERMEDIATE_DIR, "agents"),
          processedIntermediateFiles,
          safeCopy,
        },
      );
    }

    for (const [src, dest] of Object.entries(tool.rootFiles)) {
      const srcPath = path.join(__dirname, "config", src);
      if (fs.existsSync(srcPath)) {
        await linkOrCopy(srcPath, path.join(targetPath, dest));
      }
    }

    for (const [src, dest] of Object.entries(tool.configFiles)) {
      const srcPath = path.join(__dirname, "config", src);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(targetPath, dest);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        await safeCopy(srcPath, destPath);
      }
    }

    if (useSymlinks) {
      updateGitignore(targetPath, tool);
      addGitignoreEntry(targetPath, INTERMEDIATE_DIR, "mvagnon/agents");
    }

    const toolSummary = [
      `Rules:  ${stats.rules} ${mode}`,
      paths.skills ? `Skills: ${stats.skills} ${mode}` : null,
      paths.agents ? `Agents: ${stats.agents} ${mode}` : null,
      ...Object.values(tool.rootFiles).map((f) => `${f}: ${mode}`),
      ...Object.values(tool.configFiles).map((f) => `${f}: copied`),
      useSymlinks ? `.gitignore: entries added` : `.gitignore: not modified`,
    ].filter(Boolean);

    summaryLines.push({ tool, lines: toolSummary });
  }

  s.stop("Setup complete");

  for (const { tool, lines } of summaryLines) {
    p.note(lines.join("\n"), `${tool.label} Setup`);
  }

  p.note(
    [
      "1. Modify `project.md` to add project-specific rules;",
      "2. Add rules, skills, agents, MCPs or plugins based on your needs for each tool.",
    ].join("\n"),
    "Next Steps",
  );

  p.outro("Done");
}

function resolvePath(inputPath) {
  if (inputPath.startsWith("~")) {
    inputPath = inputPath.replace("~", process.env.HOME);
  }
  return path.resolve(inputPath);
}

function isTechOrArchSpecific(name) {
  const allTechs = TECHNOLOGIES.map((t) => t.value);
  const allArchs = ARCHITECTURES.filter((a) => a.value !== "none").map(
    (a) => a.value,
  );

  return (
    allTechs.some((tech) => name.startsWith(`${tech}-`)) ||
    allArchs.some((arch) => name.includes(arch))
  );
}

function shouldInclude(name, selectedTechs, selectedArchs) {
  if (!isTechOrArchSpecific(name)) return true;

  const matchesTech = selectedTechs.some((tech) => name.startsWith(`${tech}-`));
  const matchesArch = selectedArchs
    .filter((arch) => arch !== "none")
    .some((arch) => name.includes(arch));

  return matchesTech || matchesArch;
}

async function linkMatchingItems(
  sourceDir,
  targetDir,
  selectedTechs,
  selectedArchs,
  linkOrCopy,
  {
    filterExtension,
    directoriesOnly,
    copiedItems = [],
    intermediateDir,
    safeCopy,
    processedIntermediateFiles = new Set(),
  } = {},
) {
  if (!fs.existsSync(sourceDir)) return 0;

  let count = 0;

  for (const entry of fs.readdirSync(sourceDir)) {
    const fullPath = path.join(sourceDir, entry);
    const isDir = fs.statSync(fullPath).isDirectory();

    if (directoriesOnly && !isDir) continue;
    if (filterExtension && !entry.endsWith(filterExtension)) continue;

    const name = entry.replace(/\.md$/, "");

    if (!shouldInclude(name, selectedTechs, selectedArchs)) continue;

    const isCopied = copiedItems.includes(name) && intermediateDir;

    if (isCopied) {
      const intermediatePath = path.join(intermediateDir, entry);
      fs.mkdirSync(intermediateDir, { recursive: true });

      if (!processedIntermediateFiles.has(intermediatePath)) {
        await safeCopy(fullPath, intermediatePath);
        processedIntermediateFiles.add(intermediatePath);
      }

      await linkOrCopy(intermediatePath, path.join(targetDir, entry));
    } else {
      await linkOrCopy(fullPath, path.join(targetDir, entry));
    }

    count++;
  }

  return count;
}

async function copyWithConfirm(source, target, { spinner, projectRoot } = {}) {
  if (fs.existsSync(target)) {
    try {
      if (!fs.lstatSync(target).isSymbolicLink()) {
        const label = projectRoot
          ? path.relative(projectRoot, target)
          : path.basename(target);
        if (spinner) spinner.stop("Existing file found");
        const overwrite = await p.confirm({
          message: `${label} already exists. Overwrite?`,
          initialValue: false,
        });
        if (p.isCancel(overwrite)) {
          p.cancel("Setup cancelled");
          process.exit(0);
        }
        if (spinner) spinner.start("Continuing setup");
        if (!overwrite) return false;
      }
    } catch {
      // lstat failed, proceed with copy
    }
  }

  copyPath(source, target);
  return true;
}

function removePath(target) {
  if (
    fs.existsSync(target) ||
    fs.lstatSync(target, { throwIfNoEntry: false })
  ) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function createSymlink(source, target) {
  removePath(target);
  fs.symlinkSync(source, target);
}

function copyPath(source, target) {
  removePath(target);

  if (fs.statSync(source).isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
  } else {
    fs.copyFileSync(source, target);
  }
}

function updateGitignore(targetPath, tool) {
  const gitignorePath = path.join(targetPath, ".gitignore");
  const sectionHeader = `# ${tool.label} Configuration`;
  let content = "";

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, "utf-8");

    if (content.includes(sectionHeader)) return;

    if (content.length > 0 && !content.endsWith("\n")) content += "\n";
    content += "\n";
  }

  content += sectionHeader + "\n";
  content += tool.gitignoreEntries.join("\n") + "\n";

  fs.writeFileSync(gitignorePath, content);
}

function addGitignoreEntry(targetPath, entry, sectionComment) {
  const gitignorePath = path.join(targetPath, ".gitignore");
  let content = "";

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, "utf-8");
    if (content.split("\n").some((line) => line.trim() === entry)) return;
    if (content.length > 0 && !content.endsWith("\n")) content += "\n";
    content += "\n";
  }

  if (sectionComment) {
    content += `# ${sectionComment}\n`;
  }
  content += entry + "\n";
  fs.writeFileSync(gitignorePath, content);
}

main().catch(console.error);
