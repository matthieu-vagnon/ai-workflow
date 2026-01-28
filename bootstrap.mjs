#!/usr/bin/env node

import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TECHNOLOGIES = [
  { value: "react", label: "React", hint: "Components, hooks, patterns" },
  { value: "ts", label: "TypeScript", hint: "Conventions, testing" },
];

const GENERIC_RULES = ["project-stack"];

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

  p.intro(`OpenCode Workflow → ${targetPath}`);

  const config = await p.group(
    {
      techs: () =>
        p.multiselect({
          message: "Select technologies",
          options: TECHNOLOGIES,
          required: false,
        }),

      useSymlinks: () =>
        p.confirm({
          message: "Use symlinks?",
          initialValue: true,
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
  const useSymlinks = config.useSymlinks;
  const linkOrCopy = useSymlinks ? createSymlink : copyPath;

  const s = p.spinner();
  s.start(useSymlinks ? "Creating symlinks" : "Copying files");

  const stats = { rules: 0, skills: 0, agents: 0 };

  // Create directories
  fs.mkdirSync(path.join(targetPath, ".opencode", "rules"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(targetPath, ".opencode", "skills"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(targetPath, ".opencode", "agents"), {
    recursive: true,
  });

  // Link/copy rules
  const rulesDir = path.join(__dirname, ".opencode", "rules");
  if (fs.existsSync(rulesDir)) {
    for (const file of fs.readdirSync(rulesDir)) {
      if (!file.endsWith(".md")) continue;
      if (shouldIncludeRule(file, selectedTechs)) {
        const isGenericRule = isGeneric(file);
        // Generic rules are always copied (not symlinked) to allow customization
        const action = isGenericRule ? copyPath : linkOrCopy;
        action(
          path.join(rulesDir, file),
          path.join(targetPath, ".opencode", "rules", file),
        );
        stats.rules++;
      }
    }
  }

  // Link/copy skills
  const skillsDir = path.join(__dirname, ".opencode", "skills");
  if (fs.existsSync(skillsDir)) {
    for (const dir of fs.readdirSync(skillsDir)) {
      const skillPath = path.join(skillsDir, dir);
      if (fs.statSync(skillPath).isDirectory()) {
        linkOrCopy(
          skillPath,
          path.join(targetPath, ".opencode", "skills", dir),
        );
        stats.skills++;
      }
    }
  }

  // Link/copy agents
  const agentsDir = path.join(__dirname, ".opencode", "agents");
  if (fs.existsSync(agentsDir)) {
    for (const dir of fs.readdirSync(agentsDir)) {
      const agentPath = path.join(agentsDir, dir);
      if (fs.statSync(agentPath).isDirectory()) {
        linkOrCopy(
          agentPath,
          path.join(targetPath, ".opencode", "agents", dir),
        );
        stats.agents++;
      }
    }
  }

  // Link/copy AGENTS.md
  linkOrCopy(
    path.join(__dirname, "AGENTS.md"),
    path.join(targetPath, "AGENTS.md"),
  );

  // Always copy opencode.json
  copyPath(
    path.join(__dirname, "opencode.json"),
    path.join(targetPath, "opencode.json"),
  );

  s.stop("Setup complete");

  const mode = useSymlinks ? "linked" : "copied";
  p.note(
    [
      `Rules:         ${stats.rules} ${mode}`,
      `Skills:        ${stats.skills} ${mode}`,
      `Agents:        ${stats.agents} ${mode}`,
      `AGENTS.md:     ${mode}`,
      `opencode.json: copied`,
    ].join("\n"),
    "Summary",
  );

  p.outro("Done");
}

function resolvePath(inputPath) {
  if (inputPath.startsWith("~")) {
    inputPath = inputPath.replace("~", process.env.HOME);
  }
  return path.resolve(inputPath);
}

function shouldIncludeRule(filename, selectedTechs) {
  const name = filename.replace(".md", "");
  if (GENERIC_RULES.includes(name)) return true;
  return selectedTechs.some((tech) => name.startsWith(`${tech}-`));
}

function isGeneric(filename) {
  const name = filename.replace(".md", "");
  return GENERIC_RULES.includes(name);
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

main().catch(console.error);
