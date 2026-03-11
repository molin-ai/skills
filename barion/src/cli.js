#!/usr/bin/env node

import process from "node:process";
import { parseArgv } from "./args.js";
import { isApiSuccess, sendBarionRequest } from "./api.js";
import { configFromEnv, getConfigPath, loadConfig, presentConfig, sanitizeConfig, saveConfig } from "./config.js";
import {
  COMMAND_ALIASES,
  CONFIG_KEYS,
  DEFAULT_TIMEOUT_MS,
  ENDPOINTS,
  ENV_KEYS,
  TEMPLATE_BY_COMMAND
} from "./constants.js";
import { getHelpText } from "./help.js";
import {
  applySetOptions,
  jsonStringify,
  mergeObjects,
  normalizeError,
  parseBoolean,
  parseNumber,
  printJson,
  readJsonFile,
  readStdinIfNeeded
} from "./utils.js";
import { validatePostPayload, validateStatePayload } from "./validation.js";

function printHelp(topic) {
  process.stdout.write(`${getHelpText(topic)}\n`);
}

function printVersion() {
  process.stdout.write("0.1.0\n");
}

function resolveSandbox(options, config) {
  if (options.production) {
    return false;
  }

  if (options.sandbox !== undefined && options.sandbox !== true) {
    return parseBoolean(options.sandbox);
  }

  if (options.sandbox === true) {
    return true;
  }

  return config.sandbox ?? true;
}

function resolveTimeout(options, config) {
  if (options.timeoutMs !== undefined) {
    return parseNumber(options.timeoutMs, "timeoutMs");
  }

  return config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
}

function resolvePosKey(options, config) {
  const posKey = options.posKey ?? config.posKey;

  if (!posKey) {
    throw new Error(
      `Missing POS key. Set it with "barion config init", or use ${ENV_KEYS.posKey}, or pass --pos-key.`
    );
  }

  return posKey;
}

async function loadPayload(options, initialPayload = {}) {
  const fromFile = options.dataFile ? await readJsonFile(options.dataFile) : null;
  const fromStdin = await readStdinIfNeeded(Boolean(options.stdin));
  const merged = mergeObjects(initialPayload, fromFile, fromStdin);
  return applySetOptions(merged, options.set || []);
}

function formatResponse(response) {
  const lines = [`HTTP ${response.status} ${response.statusText}`];

  if (response.body?.PaymentId) {
    lines.push(`PaymentId: ${response.body.PaymentId}`);
  }

  if (response.body?.Status) {
    lines.push(`Status: ${response.body.Status}`);
  }

  if (response.body?.PaymentStatus) {
    lines.push(`PaymentStatus: ${response.body.PaymentStatus}`);
  }

  if (response.body?.GatewayUrl) {
    lines.push(`GatewayUrl: ${response.body.GatewayUrl}`);
  }

  if (response.body?.Errors?.length) {
    lines.push(`Errors: ${response.body.Errors.map((item) => item.Title || item.Description || JSON.stringify(item)).join("; ")}`);
  }

  return `${lines.join("\n")}\n`;
}

async function handleConfig(subcommand, options, positionals) {
  const configPath = getConfigPath(options.config);
  const currentConfig = await loadConfig(configPath);

  if (subcommand === "path") {
    process.stdout.write(`${configPath}\n`);
    return;
  }

  if (subcommand === "show") {
    const payload = { configPath, config: presentConfig(currentConfig, Boolean(options.revealSecrets)) };

    if (options.json) {
      printJson(payload);
      return;
    }

    process.stdout.write(`configPath: ${payload.configPath}\n`);
    process.stdout.write(`posKey: ${payload.config.posKey}\n`);
    process.stdout.write(`sandbox: ${payload.config.sandbox}\n`);
    process.stdout.write(`timeoutMs: ${payload.config.timeoutMs}\n`);
    process.stdout.write(`baseUrl: ${payload.config.baseUrl}\n`);
    return;
  }

  if (subcommand === "init") {
    const nextConfig = sanitizeConfig({
      ...currentConfig,
      posKey: options.posKey ?? currentConfig.posKey,
      sandbox: options.sandbox !== undefined ? resolveSandbox(options, currentConfig) : currentConfig.sandbox,
      timeoutMs: options.timeoutMs !== undefined ? resolveTimeout(options, currentConfig) : currentConfig.timeoutMs,
      baseUrl: options.baseUrl ?? currentConfig.baseUrl
    });

    if (!nextConfig.posKey) {
      throw new Error("config init requires --pos-key unless it already exists in the config file.");
    }

    await saveConfig(configPath, nextConfig);
    process.stdout.write(`Saved config to ${configPath}\n`);
    return;
  }

  if (subcommand === "set") {
    const [key, rawValue] = positionals;

    if (!key || rawValue === undefined) {
      throw new Error("config set requires a key and a value.");
    }

    if (!CONFIG_KEYS.includes(key)) {
      throw new Error(`Unsupported config key "${key}". Allowed keys: ${CONFIG_KEYS.join(", ")}`);
    }

    const nextConfig = { ...currentConfig };

    if (key === "sandbox") {
      nextConfig.sandbox = parseBoolean(rawValue);
    } else if (key === "timeoutMs") {
      nextConfig.timeoutMs = parseNumber(rawValue, "timeoutMs");
    } else {
      nextConfig[key] = rawValue;
    }

    await saveConfig(configPath, nextConfig);
    process.stdout.write(`Updated ${key} in ${configPath}\n`);
    return;
  }

  throw new Error(`Unknown config subcommand: ${subcommand || "<missing>"}`);
}

async function handleDoctor(options) {
  const configPath = getConfigPath(options.config);
  const config = mergeObjects(await loadConfig(configPath), configFromEnv());
  const payload = {
    configPath,
    config: presentConfig(config),
    environment: {
      node: process.version,
      sandbox: config.sandbox ?? true,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      baseUrl: config.baseUrl || ""
    }
  };

  if (options.json) {
    printJson(payload);
    return;
  }

  process.stdout.write(`configPath: ${payload.configPath}\n`);
  process.stdout.write(`posKey: ${payload.config.posKey}\n`);
  process.stdout.write(`sandbox: ${payload.environment.sandbox}\n`);
  process.stdout.write(`timeoutMs: ${payload.environment.timeoutMs}\n`);
  process.stdout.write(`baseUrl: ${payload.environment.baseUrl}\n`);
  process.stdout.write(`node: ${payload.environment.node}\n`);
}

function templateName(input) {
  return COMMAND_ALIASES[input] || input;
}

async function handleEndpoint(command, options) {
  const configPath = getConfigPath(options.config);
  const config = mergeObjects(await loadConfig(configPath), configFromEnv());
  const sandbox = resolveSandbox(options, config);
  const timeoutMs = resolveTimeout(options, config);
  const baseUrl = options.baseUrl ?? config.baseUrl;
  const initialPayload = command === "state" ? { paymentId: options.paymentId } : {};
  const payload = await loadPayload(options, initialPayload);
  const validatedPayload = command === "state" ? validateStatePayload(payload) : validatePostPayload(command, payload);

  if (options.dryRun) {
    printJson({
      command,
      endpoint: ENDPOINTS[command],
      baseUrl,
      sandbox,
      payload: validatedPayload,
      timeoutMs
    });
    return;
  }

  const posKey = resolvePosKey(options, config);
  const response = await sendBarionRequest({
    command,
    payload: validatedPayload,
    posKey,
    sandbox,
    baseUrl,
    timeoutMs
  });

  if (options.json) {
    printJson(response);
  } else {
    process.stdout.write(formatResponse(response));
  }

  if (!response.ok || !isApiSuccess(response.body)) {
    process.exitCode = 1;
  }
}

function printTemplate(command) {
  const name = templateName(command);
  const template = TEMPLATE_BY_COMMAND[name];

  if (!template) {
    throw new Error(`Unknown template "${command}".`);
  }

  process.stdout.write(jsonStringify(template));
}

async function main() {
  const { command, subcommand, options, positionals } = parseArgv(process.argv.slice(2));

  switch (command) {
    case "help":
      printHelp(subcommand);
      return;
    case "version":
      printVersion();
      return;
    case "config":
      await handleConfig(subcommand, options, positionals);
      return;
    case "doctor":
      await handleDoctor(options);
      return;
    case "template":
      printTemplate(subcommand);
      return;
    case "start":
    case "state":
    case "complete":
    case "finishReservation":
    case "capture":
    case "cancelAuthorization":
    case "refund":
      await handleEndpoint(command, options);
      return;
    default:
      if (options.help) {
        printHelp();
        return;
      }
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  process.stderr.write(`Error: ${normalizeError(error)}\n`);
  process.exit(1);
});
