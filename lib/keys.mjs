import * as p from "@clack/prompts";
import { loadApiKeys, saveApiKeys, maskKey, CONFIG_FILE } from "./apikeys.mjs";

export async function runKeys() {
  p.intro(`API Keys → ${CONFIG_FILE}`);

  let keys = loadApiKeys();

  while (true) {
    const keyNames = Object.keys(keys);

    const options = [
      { value: "add", label: "Add a key" },
    ];
    if (keyNames.length > 0) {
      options.push(
        { value: "edit", label: "Edit a key" },
        { value: "delete", label: "Delete a key" },
      );
    }
    options.push({ value: "quit", label: "Quit" });

    const action = await p.select({
      message: "What do you want to do?",
      options,
    });
    if (p.isCancel(action) || action === "quit") break;

    if (action === "add") {
      const name = await p.text({
        message: "Service name (e.g. Context7)",
        validate: (v) => {
          if (!v.trim()) return "Name is required";
          if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(v.trim()))
            return "Name must start with a letter and contain only letters, digits, underscores";
        },
      });
      if (p.isCancel(name)) continue;

      const value = await p.password({
        message: `API key for ${name.trim()}`,
      });
      if (p.isCancel(value)) continue;
      if (!value) {
        p.log.warn("Empty key — skipped");
        continue;
      }

      keys[name.trim()] = value;
      saveApiKeys(keys);
      p.log.success(`${name.trim()} saved`);
    }

    if (action === "edit") {
      const target = await p.select({
        message: "Select key to edit",
        options: keyNames.map((k) => ({
          value: k,
          label: `${k} (${maskKey(keys[k])})`,
        })),
      });
      if (p.isCancel(target)) continue;

      const value = await p.password({
        message: `New API key for ${target}`,
      });
      if (p.isCancel(value)) continue;
      if (!value) {
        p.log.warn("Empty key — skipped");
        continue;
      }

      keys[target] = value;
      saveApiKeys(keys);
      p.log.success(`${target} updated`);
    }

    if (action === "delete") {
      const target = await p.select({
        message: "Select key to delete",
        options: keyNames.map((k) => ({
          value: k,
          label: `${k} (${maskKey(keys[k])})`,
        })),
      });
      if (p.isCancel(target)) continue;

      const confirm = await p.confirm({
        message: `Delete ${target}?`,
        initialValue: false,
      });
      if (p.isCancel(confirm) || !confirm) continue;

      delete keys[target];
      saveApiKeys(keys);
      p.log.success(`${target} deleted`);
    }
  }

  p.outro("Done");
}
