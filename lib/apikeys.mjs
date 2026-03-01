import fs from "node:fs";
import path from "node:path";
import { STABLE_BASE } from "./sync.mjs";

const CONFIG_FILE = path.join(STABLE_BASE, "config.json");

/**
 * Load API keys from ~/.config/mvagnon/agents/config.json
 * Returns an object like { "Context7": "sk-xxx" }
 */
export function loadApiKeys() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * Save API keys object to ~/.config/mvagnon/agents/config.json
 */
export function saveApiKeys(keys) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(keys, null, 2) + "\n", "utf-8");
}

/**
 * Mask a key for display: "sk-abc123xyz" → "sk-***xyz"
 */
export function maskKey(key) {
  if (key.length <= 6) return "***";
  return key.slice(0, 3) + "***" + key.slice(-3);
}

/**
 * Scan config files for {ServiceName} placeholders.
 * Matches values like "{Context7}" in JSON strings and TOML values.
 * Returns a Set<string> of service names.
 */
export function scanPlaceholders(filePaths) {
  const placeholders = new Set();
  const pattern = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf-8");
    let match;
    while ((match = pattern.exec(content)) !== null) {
      placeholders.add(match[1]);
    }
  }

  return placeholders;
}

/**
 * Replace {ServiceName} placeholders in content with corresponding API keys.
 * Unresolved placeholders are left as-is.
 */
export function replacePlaceholders(content, apiKeys) {
  return content.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, name) => {
    return apiKeys[name] !== undefined ? apiKeys[name] : match;
  });
}

export { CONFIG_FILE };
