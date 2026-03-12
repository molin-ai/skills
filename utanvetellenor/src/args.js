import { toCamelCase } from "./utils.js";

const FLAG_ALIASES = {
  h: "help",
  v: "version"
};

function isNegativeNumberToken(value) {
  return /^-\d+(\.\d+)?$/.test(value);
}

export function parseArgv(argv) {
  const tokens = [...argv];
  let command = "help";
  let subcommand = null;
  let cursor = 0;

  if (tokens[cursor] && !tokens[cursor].startsWith("-")) {
    command = tokens[cursor];
    cursor += 1;
  }

  if (
    tokens[cursor] &&
    !tokens[cursor].startsWith("-") &&
    ["config", "template", "help"].includes(command)
  ) {
    subcommand = tokens[cursor];
    cursor += 1;
  }

  const options = {};
  const positionals = [];

  while (cursor < tokens.length) {
    const token = tokens[cursor];

    if (!token.startsWith("-")) {
      positionals.push(token);
      cursor += 1;
      continue;
    }

    if (token === "--") {
      positionals.push(...tokens.slice(cursor + 1));
      break;
    }

    if (token.startsWith("--")) {
      const [rawName, inlineValue] = token.slice(2).split("=", 2);
      const isNegative = rawName.startsWith("no-");
      const normalizedName = toCamelCase(isNegative ? rawName.slice(3) : rawName);

      if (inlineValue !== undefined) {
        options[normalizedName] = inlineValue;
        cursor += 1;
        continue;
      }

      const next = tokens[cursor + 1];

      if (isNegative) {
        options[normalizedName] = false;
        cursor += 1;
        continue;
      }

      if (next === undefined || (next.startsWith("-") && !isNegativeNumberToken(next))) {
        options[normalizedName] = true;
        cursor += 1;
        continue;
      }

      options[normalizedName] = next;
      cursor += 2;
      continue;
    }

    const alias = FLAG_ALIASES[token.slice(1)];

    if (!alias) {
      throw new Error(`Unknown short flag: ${token}`);
    }

    options[alias] = true;
    cursor += 1;
  }

  return { command, subcommand, options, positionals };
}
