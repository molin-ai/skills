import { readFile } from "node:fs/promises";
import process from "node:process";

export function toCamelCase(input) {
  return input.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function toFlagName(input) {
  return input.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
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
    throw new Error(`${label} must be a number.`);
  }

  return parsed;
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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

export function jsonStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function readJsonFile(filePath) {
  const content = await readFile(filePath, "utf8");
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

  if (!content) {
    return null;
  }

  return JSON.parse(content);
}

export function pickDefined(source, keys) {
  return keys.reduce((accumulator, key) => {
    if (source[key] !== undefined) {
      accumulator[key] = source[key];
    }
    return accumulator;
  }, {});
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

export function normalizeError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
