import { BASE_URLS, DEFAULT_TIMEOUT_MS, ENDPOINTS, STATUS_CODES } from "./constants.js";

export function buildBaseUrl({ sandbox = false, baseUrl } = {}) {
  if (baseUrl) {
    return baseUrl.replace(/\/$/, "");
  }

  return sandbox ? BASE_URLS.sandbox : BASE_URLS.production;
}

export function buildAuthHeader(publicKey, privateKey) {
  const token = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
}

export async function sendApiRequest({
  endpoint,
  payload,
  publicKey,
  privateKey,
  sandbox = false,
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch
}) {
  const targetUrl = `${buildBaseUrl({ sandbox, baseUrl })}${ENDPOINTS[endpoint]}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(targetUrl, {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(publicKey, privateKey),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

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
      apiStatusText: STATUS_CODES[body?.status] ?? null,
      body
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isSuccessfulApiBody(endpoint, body) {
  if (!body || typeof body !== "object") {
    return false;
  }

  if (body.error) {
    return false;
  }

  if (body.status === undefined) {
    return true;
  }

  if (body.status === 0 || body.status === 200) {
    return true;
  }

  if (endpoint === "request" && body.status === 404 && body.result?.reason === "No Signals were found.") {
    return true;
  }

  return false;
}
