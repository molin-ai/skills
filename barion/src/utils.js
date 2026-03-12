import { readFile } from "node:fs/promises";
import process from "node:process";

export function toCamelCase(input) {
  return input.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

export function parseNumber(value, label) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be numeric.`);
  }

  return parsed;
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function mergeObjects(...objects) {
  return objects.reduce((accumulator, current) => {
    if (!isPlainObject(current)) {
      return accumulator;
    }

    for (const [key, value] of Object.entries(current)) {
      if (value !== undefined) {
        accumulator[key] = value;
      }
    }

    return accumulator;
  }, {});
}

export async function readJsonFile(path) {
  const content = await readFile(path, "utf8");
  return JSON.parse(content);
}

export async function readStdinIfNeeded(enabled) {
  if (!enabled || process.stdin.isTTY) {
    return null;
  }

  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const content = Buffer.concat(chunks).toString("utf8").trim();
  return content ? JSON.parse(content) : null;
}

export function jsonStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function printJson(value) {
  process.stdout.write(jsonStringify(value));
}

export function normalizeError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function parseInlineValue(rawValue) {
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  if (rawValue === "null") {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  if (
    (rawValue.startsWith("{") && rawValue.endsWith("}")) ||
    (rawValue.startsWith("[") && rawValue.endsWith("]")) ||
    (rawValue.startsWith("\"") && rawValue.endsWith("\""))
  ) {
    return JSON.parse(rawValue);
  }

  return rawValue;
}

export function setByPath(target, path, value) {
  const segments = path.split(".").filter(Boolean);

  if (segments.length === 0) {
    throw new Error("Invalid path for --set.");
  }

  let current = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];
    const key = /^\d+$/.test(segment) ? Number(segment) : segment;
    const shouldBeArray = /^\d+$/.test(nextSegment);

    if (current[key] === undefined) {
      current[key] = shouldBeArray ? [] : {};
    }

    current = current[key];
  }

  const finalSegment = segments.at(-1);
  const finalKey = /^\d+$/.test(finalSegment) ? Number(finalSegment) : finalSegment;
  current[finalKey] = value;
}

export function applySetOptions(basePayload, setOptions = []) {
  const payload = structuredClone(basePayload);

  for (const entry of setOptions) {
    const equalsIndex = entry.indexOf("=");

    if (equalsIndex === -1) {
      throw new Error(`Invalid --set value "${entry}". Use path=value.`);
    }

    const path = entry.slice(0, equalsIndex);
    const rawValue = entry.slice(equalsIndex + 1);
    setByPath(payload, path, parseInlineValue(rawValue));
  }

  return payload;
}

export function maskSecret(value) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "*".repeat(value.length);
  }

  return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}
