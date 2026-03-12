import { REASON_CODES, REASON_DESCRIPTIONS, STATUS_CODES } from "./constants.js";
import { jsonStringify } from "./utils.js";

export function printJson(value) {
  process.stdout.write(jsonStringify(value));
}

export function printRequestSummary(response) {
  const body = response.body || {};
  const reasonCode = REASON_CODES[body.reason_id] || "unknown";
  const reasonDescription = REASON_DESCRIPTIONS[reasonCode] || "No mapped description.";
  const statusLine = `HTTP ${response.status} ${response.statusText}`.trim();
  const apiStatusLine =
    body.status !== undefined
      ? `API status ${body.status}${STATUS_CODES[body.status] ? ` (${STATUS_CODES[body.status]})` : ""}`
      : "API status unavailable";

  process.stdout.write(`${statusLine}\n`);
  process.stdout.write(`${apiStatusLine}\n`);

  if (body.result !== undefined) {
    process.stdout.write(`result: ${body.result}\n`);
  }

  if (body.blocked !== undefined) {
    process.stdout.write(`blocked: ${body.blocked}\n`);
  }

  if (body.reputation !== undefined) {
    process.stdout.write(`reputation: ${body.reputation}\n`);
  }

  if (body.reason_id !== undefined) {
    process.stdout.write(`reason: ${body.reason_id} (${reasonCode})\n`);
    process.stdout.write(`reason detail: ${reasonDescription}\n`);
  }
}

export function printSignalSummary(response) {
  const body = response.body || {};
  const statusLine = `HTTP ${response.status} ${response.statusText}`.trim();
  const apiStatusLine =
    body.status !== undefined
      ? `API status ${body.status}${STATUS_CODES[body.status] ? ` (${STATUS_CODES[body.status]})` : ""}`
      : "API status unavailable";

  process.stdout.write(`${statusLine}\n`);
  process.stdout.write(`${apiStatusLine}\n`);

  for (const [key, value] of Object.entries(body)) {
    if (key === "status") {
      continue;
    }

    process.stdout.write(`${key}: ${typeof value === "object" ? JSON.stringify(value) : value}\n`);
  }
}
