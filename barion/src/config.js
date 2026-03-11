import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import os from "node:os";
import process from "node:process";
import { CONFIG_KEYS, DEFAULT_TIMEOUT_MS, ENV_KEYS } from "./constants.js";
import { maskSecret, parseBoolean } from "./utils.js";

export function getConfigPath(customPath) {
  if (customPath) {
    return customPath;
  }

  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  const basePath = xdgConfigHome || join(os.homedir(), ".config");
  return join(basePath, "barion-cli", "config.json");
}

export function sanitizeConfig(config) {
  const sanitized = {};

  for (const key of CONFIG_KEYS) {
    if (config[key] !== undefined) {
      sanitized[key] = config[key];
    }
  }

  if (sanitized.timeoutMs === undefined) {
    sanitized.timeoutMs = DEFAULT_TIMEOUT_MS;
  }

  if (sanitized.sandbox === undefined) {
    sanitized.sandbox = true;
  }

  return sanitized;
}

export async function loadConfig(configPath) {
  try {
    const raw = await readFile(configPath, "utf8");
    return sanitizeConfig(JSON.parse(raw));
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

export async function saveConfig(configPath, config) {
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(sanitizeConfig(config), null, 2));
}

export function configFromEnv(env = process.env) {
  const config = {};

  if (env[ENV_KEYS.posKey]) {
    config.posKey = env[ENV_KEYS.posKey];
  }

  if (env[ENV_KEYS.sandbox] !== undefined) {
    config.sandbox = parseBoolean(env[ENV_KEYS.sandbox]);
  }

  if (env[ENV_KEYS.timeoutMs] !== undefined) {
    const parsedTimeout = Number(env[ENV_KEYS.timeoutMs]);

    if (Number.isFinite(parsedTimeout)) {
      config.timeoutMs = parsedTimeout;
    }
  }

  if (env[ENV_KEYS.baseUrl]) {
    config.baseUrl = env[ENV_KEYS.baseUrl];
  }

  return sanitizeConfig(config);
}

export function presentConfig(config, revealSecrets = false) {
  return {
    posKey: revealSecrets ? config.posKey || "" : maskSecret(config.posKey || ""),
    sandbox: Boolean(config.sandbox),
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    baseUrl: config.baseUrl || ""
  };
}
