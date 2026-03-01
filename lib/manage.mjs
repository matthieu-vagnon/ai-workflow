import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";

export async function runManage({ TOOLS, CATEGORIES, INTERMEDIATE_DIR, STABLE_CONFIG_DIR }) {
  const projectRoot = process.cwd();
  const intermediateBase = path.join(projectRoot, INTERMEDIATE_DIR);

  if (!fs.existsSync(intermediateBase)) {
    console.error(
      `Error: ${INTERMEDIATE_DIR}/ not found. Run bootstrap first.`,
    );
    process.exit(1);
  }

  // Detect configured tools by checking for their directories
  const configuredTools = Object.values(TOOLS).filter((tool) =>
    Object.values(tool.paths).some((dir) =>
      fs.existsSync(path.join(projectRoot, dir)),
    ),
  );

  if (configuredTools.length === 0) {
    console.error("Error: No configured tools detected in this project.");
    process.exit(1);
  }

  p.intro(`Manage → ${projectRoot}`);
  p.note(
    configuredTools.map((t) => t.label).join(", "),
    "Configured tools",
  );

  // Determine which categories are supported
  const supportedCategories = new Set();
  for (const tool of configuredTools) {
    for (const cat of CATEGORIES) {
      if (tool.paths[cat]) supportedCategories.add(cat);
    }
  }

  for (const category of CATEGORIES) {
    if (!supportedCategories.has(category)) continue;

    const { projectSensitive, generic, currentGeneric } = scanCurrentState(
      category,
      intermediateBase,
      STABLE_CONFIG_DIR,
    );

    if (projectSensitive.length === 0 && generic.length === 0) continue;

    if (projectSensitive.length > 0) {
      p.note(
        projectSensitive.join(", "),
        `${capitalize(category)} — project-sensitive (always included)`,
      );
    }

    if (generic.length === 0) continue;

    const options = generic.map((name) => ({
      value: name,
      label: name,
      initialSelected: currentGeneric.includes(name),
    }));

    const selected = await p.multiselect({
      message: `Select generic ${category}`,
      options,
      required: false,
    });
    if (p.isCancel(selected)) {
      p.cancel("Manage cancelled");
      process.exit(0);
    }

    const selectedSet = new Set(selected || []);
    const currentSet = new Set(currentGeneric);

    const toAdd = [...selectedSet].filter((x) => !currentSet.has(x));
    const toRemove = [...currentSet].filter((x) => !selectedSet.has(x));

    if (toAdd.length === 0 && toRemove.length === 0) {
      p.log.info(`${capitalize(category)}: no changes`);
      continue;
    }

    // Apply additions
    const genSourceDir = path.join(STABLE_CONFIG_DIR, category, "generic");
    const genIntermediateDir = path.join(intermediateBase, "generic", category);

    for (const item of toAdd) {
      const srcPath = path.join(genSourceDir, item);
      if (!fs.existsSync(srcPath)) continue;

      fs.mkdirSync(genIntermediateDir, { recursive: true });
      const intermediatePath = path.join(genIntermediateDir, item);
      copyPath(srcPath, intermediatePath);

      for (const tool of configuredTools) {
        if (!tool.paths[category]) continue;
        const toolDir = path.join(projectRoot, tool.paths[category]);
        fs.mkdirSync(toolDir, { recursive: true });
        createRelativeSymlink(intermediatePath, path.join(toolDir, item));
      }
    }

    // Apply removals
    for (const item of toRemove) {
      const intermediatePath = path.join(genIntermediateDir, item);
      removePath(intermediatePath);

      for (const tool of configuredTools) {
        if (!tool.paths[category]) continue;
        const toolPath = path.join(projectRoot, tool.paths[category], item);
        removePath(toolPath);
      }
    }

    const changes = [];
    if (toAdd.length) changes.push(`added: ${toAdd.join(", ")}`);
    if (toRemove.length) changes.push(`removed: ${toRemove.join(", ")}`);
    p.log.success(`${capitalize(category)}: ${changes.join(" | ")}`);
  }

  p.outro("Done");
}

function scanCurrentState(category, intermediateBase, stableConfigDir) {
  const projectSensitive = [];
  const generic = [];
  const currentGeneric = [];

  // Available project-sensitive items from stable config
  const psDir = path.join(stableConfigDir, category, "project-sensitive");
  if (fs.existsSync(psDir)) {
    for (const entry of fs.readdirSync(psDir)) {
      if (entry === ".gitkeep") continue;
      projectSensitive.push(entry);
    }
  }

  // Available generic items from stable config
  const genDir = path.join(stableConfigDir, category, "generic");
  if (fs.existsSync(genDir)) {
    for (const entry of fs.readdirSync(genDir)) {
      if (entry === ".gitkeep") continue;
      generic.push(entry);
    }
  }

  // Currently installed generic items
  const currentGenDir = path.join(intermediateBase, "generic", category);
  if (fs.existsSync(currentGenDir)) {
    for (const entry of fs.readdirSync(currentGenDir)) {
      if (entry === ".gitkeep") continue;
      currentGeneric.push(entry);
    }
  }

  return { projectSensitive, generic, currentGeneric };
}

function removePath(target) {
  try {
    const stat = fs.lstatSync(target);
    if (stat) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  } catch {
    // Does not exist
  }
}

function createRelativeSymlink(source, target) {
  removePath(target);
  const relPath = path.relative(path.dirname(target), source);
  fs.symlinkSync(relPath, target);
}

function copyPath(source, target) {
  removePath(target);
  if (fs.statSync(source).isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
