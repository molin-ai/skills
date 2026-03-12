#!/usr/bin/env node

import process from "node:process";
import { parseArgv } from "./args.js";
import { isSuccessfulApiBody, sendApiRequest } from "./api.js";
import { loadConfig, saveConfig, getConfigPath, configFromEnv, presentConfig, sanitizeConfig } from "./config.js";
import {
  CONFIG_KEYS,
  DEFAULT_TIMEOUT_MS,
  ENV_KEYS,
  REASON_CODES,
  REASON_DESCRIPTIONS,
  REQUEST_FIELDS,
  REQUEST_TEMPLATE,
  SIGNAL_FIELDS,
  SIGNAL_TEMPLATE,
  STATUS_CODES
} from "./constants.js";
import { getHelpText } from "./help.js";
import { printJson, printRequestSummary, printSignalSummary } from "./output.js";
import { jsonStringify, mergeObjects, normalizeError, parseBoolean, parseNumber, pickDefined, readJsonFile, readStdinIfNeeded } from "./utils.js";
import { normalizePayload, stripUnknownFields, validateRequestPayload, validateSignalPayload } from "./validation.js";

function printHelp(topic) {
  process.stdout.write(`${getHelpText(topic)}\n`);
}

function printVersion() {
  process.stdout.write("0.1.0\n");
}

function normalizeCliPayload(options, allowedFields) {
  const payload = pickDefined(options, allowedFields);

  if (options.phoneNumber !== undefined) {
    payload.phoneNumber = options.phoneNumber;
  }

  if (options.countryCode !== undefined) {
    payload.countryCode = options.countryCode;
  }

  if (options.postalCode !== undefined) {
    payload.postalCode = options.postalCode;
  }

  if (options.addressLine !== undefined) {
    payload.addressLine = options.addressLine;
  }

  if (options.orderId !== undefined) {
    payload.orderId = options.orderId;
  }

  if (options.ipAddress !== undefined) {
    payload.ipAddress = options.ipAddress;
  }

  if (options.userAgent !== undefined) {
    payload.userAgent = options.userAgent;
  }

  if (options.metadata !== undefined) {
    payload.metadata = typeof options.metadata === "string" ? JSON.parse(options.metadata) : options.metadata;
  }

  return payload;
}

function resolveMode(options, config) {
  if (options.production) {
    return false;
  }

  if (options.sandbox !== undefined && options.sandbox !== true) {
    return parseBoolean(options.sandbox);
  }

  if (options.sandbox === true) {
    return true;
  }

  return Boolean(config.sandbox);
}

function resolveTimeout(options, config) {
  if (options.timeoutMs !== undefined) {
    return parseNumber(options.timeoutMs, "timeoutMs");
  }

  return config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
}

function resolveCredentials(options, config) {
  const publicKey = options.publicKey ?? config.publicKey;
  const privateKey = options.privateKey ?? config.privateKey;

  if (!publicKey || !privateKey) {
    throw new Error(
      `Missing API credentials. Set them with "uve config init", or use ${ENV_KEYS.publicKey}/${ENV_KEYS.privateKey}, or pass --public-key/--private-key.`
    );
  }

  return { publicKey, privateKey };
}

async function loadPayload(options, allowedFields) {
  const fromFile = options.dataFile ? await readJsonFile(options.dataFile) : null;
  const fromStdin = await readStdinIfNeeded(Boolean(options.stdin));
  const fromFlags = normalizeCliPayload(options, allowedFields);
  return mergeObjects(fromFile, fromStdin, fromFlags);
}

async function handleConfig(subcommand, options, positionals) {
  const configPath = getConfigPath(options.config);
  const currentConfig = await loadConfig(configPath);

  if (subcommand === "path") {
    process.stdout.write(`${configPath}\n`);
    return;
  }

  if (subcommand === "show") {
    const presented = presentConfig(currentConfig, Boolean(options.revealSecrets));

    if (options.json) {
      printJson({ configPath, config: presented });
      return;
    }

    process.stdout.write(`configPath: ${configPath}\n`);
    process.stdout.write(`publicKey: ${presented.publicKey}\n`);
    process.stdout.write(`privateKey: ${presented.privateKey}\n`);
    process.stdout.write(`sandbox: ${presented.sandbox}\n`);
    process.stdout.write(`timeoutMs: ${presented.timeoutMs}\n`);
    return;
  }

  if (subcommand === "init") {
    const nextConfig = sanitizeConfig({
      ...currentConfig,
      publicKey: options.publicKey ?? currentConfig.publicKey,
      privateKey: options.privateKey ?? currentConfig.privateKey,
      sandbox: options.sandbox !== undefined ? resolveMode(options, currentConfig) : currentConfig.sandbox,
      timeoutMs: options.timeoutMs !== undefined ? resolveTimeout(options, currentConfig) : currentConfig.timeoutMs
    });

    if (!nextConfig.publicKey || !nextConfig.privateKey) {
      throw new Error("config init requires --public-key and --private-key unless they already exist in the config file.");
    }

    await saveConfig(configPath, nextConfig);
    process.stdout.write(`Saved config to ${configPath}\n`);
    return;
  }

  if (subcommand === "set") {
    const [rawKey, rawValue] = positionals;

    if (!rawKey || rawValue === undefined) {
      throw new Error("config set requires a key and a value.");
    }

    if (!CONFIG_KEYS.includes(rawKey)) {
      throw new Error(`Unsupported config key "${rawKey}". Allowed keys: ${CONFIG_KEYS.join(", ")}`);
    }

    const nextConfig = { ...currentConfig };

    if (rawKey === "sandbox") {
      nextConfig.sandbox = parseBoolean(rawValue);
    } else if (rawKey === "timeoutMs") {
      nextConfig.timeoutMs = parseNumber(rawValue, "timeoutMs");
    } else {
      nextConfig[rawKey] = rawValue;
    }

    await saveConfig(configPath, nextConfig);
    process.stdout.write(`Updated ${rawKey} in ${configPath}\n`);
    return;
  }

  throw new Error(`Unknown config subcommand: ${subcommand || "<missing>"}`);
}

async function handleDoctor(options) {
  const configPath = getConfigPath(options.config);
  const config = mergeObjects(await loadConfig(configPath), configFromEnv());
  const doctor = {
    configPath,
    config: presentConfig(config, false),
    environment: {
      node: process.version,
      sandbox: Boolean(config.sandbox),
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    }
  };

  if (options.json) {
    printJson(doctor);
    return;
  }

  process.stdout.write(`configPath: ${doctor.configPath}\n`);
  process.stdout.write(`publicKey: ${doctor.config.publicKey}\n`);
  process.stdout.write(`privateKey: ${doctor.config.privateKey}\n`);
  process.stdout.write(`sandbox: ${doctor.environment.sandbox}\n`);
  process.stdout.write(`timeoutMs: ${doctor.environment.timeoutMs}\n`);
  process.stdout.write(`node: ${doctor.environment.node}\n`);
}

async function handleRequestLike(endpoint, options) {
  const configPath = getConfigPath(options.config);
  const fileConfig = await loadConfig(configPath);
  const resolvedConfig = mergeObjects(fileConfig, configFromEnv());
  const sandbox = resolveMode(options, resolvedConfig);
  const timeoutMs = resolveTimeout(options, resolvedConfig);
  const allowedFields = endpoint === "request" ? REQUEST_FIELDS : SIGNAL_FIELDS;
  const payload = stripUnknownFields(normalizePayload(await loadPayload(options, allowedFields)), allowedFields);
  const validatedPayload =
    endpoint === "request" ? validateRequestPayload(payload) : validateSignalPayload(payload);

  if (options.dryRun) {
    printJson({
      endpoint,
      baseUrl: options.baseUrl || (sandbox ? "https://sandbox.utanvet-ellenor.hu" : "https://www.utanvet-ellenor.hu"),
      payload: validatedPayload,
      timeoutMs
    });
    return;
  }

  const credentials = resolveCredentials(options, resolvedConfig);
  const response = await sendApiRequest({
    endpoint,
    payload: validatedPayload,
    publicKey: credentials.publicKey,
    privateKey: credentials.privateKey,
    sandbox,
    baseUrl: options.baseUrl,
    timeoutMs
  });

  if (options.json) {
    printJson(response);
  } else if (endpoint === "request") {
    printRequestSummary(response);
  } else {
    printSignalSummary(response);
  }

  if (!response.ok || !isSuccessfulApiBody(endpoint, response.body)) {
    process.exitCode = 1;
  }
}

function printTemplate(name, asJson) {
  const template = name === "signal" ? SIGNAL_TEMPLATE : REQUEST_TEMPLATE;

  if (asJson) {
    printJson(template);
    return;
  }

  process.stdout.write(jsonStringify(template));
}

function printReasons(asJson) {
  const reasons = Object.entries(REASON_CODES).map(([id, code]) => ({
    id: Number(id),
    code,
    description: REASON_DESCRIPTIONS[code] || ""
  }));

  if (asJson) {
    printJson(reasons);
    return;
  }

  for (const reason of reasons) {
    process.stdout.write(`${reason.id}\t${reason.code}\t${reason.description}\n`);
  }
}

function printStatusCodes(asJson) {
  const rows = Object.entries(STATUS_CODES).map(([id, label]) => ({
    id: Number(id),
    label
  }));

  if (asJson) {
    printJson(rows);
    return;
  }

  for (const row of rows) {
    process.stdout.write(`${row.id}\t${row.label}\n`);
  }
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
    case "request":
      await handleRequestLike("request", options);
      return;
    case "signal":
      await handleRequestLike("signal", options);
      return;
    case "template":
      if (!subcommand || !["request", "signal"].includes(subcommand)) {
        throw new Error('template requires "request" or "signal".');
      }
      printTemplate(subcommand, Boolean(options.json));
      return;
    case "reasons":
      printReasons(Boolean(options.json));
      return;
    case "status-codes":
      printStatusCodes(Boolean(options.json));
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
