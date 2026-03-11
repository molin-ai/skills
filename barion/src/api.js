import { BASE_URLS, DEFAULT_TIMEOUT_MS, ENDPOINTS } from "./constants.js";

export function buildBaseUrl({ sandbox = true, baseUrl } = {}) {
  if (baseUrl) {
    return baseUrl.replace(/\/$/, "");
  }

  return sandbox ? BASE_URLS.sandbox : BASE_URLS.production;
}

export function buildStateHeaders(posKey) {
  return {
    Accept: "application/json",
    "x-pos-key": posKey
  };
}

export async function sendBarionRequest({
  command,
  payload,
  posKey,
  sandbox = true,
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch
}) {
  const endpoint = ENDPOINTS[command];

  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${command}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const rootUrl = buildBaseUrl({ sandbox, baseUrl });

  try {
    let url = `${rootUrl}${endpoint.path}`;
    let requestInit;

    if (command === "state") {
      url = url.replace("{PaymentId}", encodeURIComponent(payload.paymentId));
      requestInit = {
        method: endpoint.method,
        headers: buildStateHeaders(posKey),
        signal: controller.signal
      };
    } else {
      const requestBody = payload.POSKey ? payload : { ...payload, POSKey: posKey };

      requestInit = {
        method: endpoint.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      };
    }

    const response = await fetchImpl(url, requestInit);
    const rawBody = await response.text();
    let body = null;

    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = { raw: rawBody };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isApiSuccess(body) {
  if (!body || typeof body !== "object") {
    return false;
  }

  if (typeof body.IsSuccessful === "boolean") {
    return body.IsSuccessful;
  }

  if (body.Errors && Array.isArray(body.Errors) && body.Errors.length > 0) {
    return false;
  }

  if (body.Error || body.error) {
    return false;
  }

  return true;
}
