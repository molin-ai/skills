const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const IPV4_OR_IPV6_PATTERN =
  /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-fA-F0-9]{0,4}:){2,7}[a-fA-F0-9]{0,4})$/;
const FIELD_ALIASES = {
  phone_number: "phoneNumber",
  country_code: "countryCode",
  postal_code: "postalCode",
  address_line: "addressLine",
  order_id: "orderId",
  ip_address: "ipAddress",
  user_agent: "userAgent"
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function normalizePayload(input) {
  const payload = {};

  for (const [key, value] of Object.entries(input)) {
    const normalizedKey = FIELD_ALIASES[key] || key;

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (["threshold", "outcome", "amount"].includes(normalizedKey)) {
      payload[normalizedKey] = Number(value);
      continue;
    }

    if (normalizedKey === "countryCode") {
      payload[normalizedKey] = String(value).toUpperCase();
      continue;
    }

    payload[normalizedKey] = value;
  }

  return payload;
}

export function validateRequestPayload(payload) {
  assert(typeof payload.email === "string" && EMAIL_PATTERN.test(payload.email), "email is required and must be valid.");
  assert(typeof payload.threshold === "number" && Number.isFinite(payload.threshold), "threshold is required and must be numeric.");
  assert(payload.threshold >= 0 && payload.threshold <= 1, "threshold must be between 0 and 1.");

  if (payload.phoneNumber !== undefined || payload.countryCode !== undefined || payload.postalCode !== undefined || payload.addressLine !== undefined) {
    assert(typeof payload.phoneNumber === "string" && PHONE_PATTERN.test(payload.phoneNumber), "phoneNumber must be in E.164 format when extended fields are used.");
    assert(typeof payload.countryCode === "string" && /^[A-Z]{2}$/.test(payload.countryCode), "countryCode must be a two-letter ISO country code when extended fields are used.");
    assert(typeof payload.postalCode === "string" && payload.postalCode.trim().length > 0, "postalCode is required when extended fields are used.");
    assert(typeof payload.addressLine === "string" && payload.addressLine.trim().length > 0, "addressLine is required when extended fields are used.");
  }

  if (payload.ipAddress !== undefined) {
    assert(IPV4_OR_IPV6_PATTERN.test(String(payload.ipAddress)), "ipAddress must be a valid IPv4 or IPv6 address.");
  }

  if (payload.amount !== undefined) {
    assert(Number.isFinite(payload.amount) && payload.amount >= 0, "amount must be a non-negative number.");
  }

  if (payload.currency !== undefined) {
    assert(/^[A-Z]{3}$/.test(String(payload.currency).toUpperCase()), "currency must be a three-letter ISO code.");
  }

  return payload;
}

export function validateSignalPayload(payload) {
  assert(typeof payload.email === "string" && EMAIL_PATTERN.test(payload.email), "email is required and must be valid.");
  assert(typeof payload.orderId === "string" && payload.orderId.trim().length > 0, "orderId is required.");
  assert(typeof payload.outcome === "number" && Number.isFinite(payload.outcome), "outcome is required and must be numeric.");
  assert(payload.outcome === 1 || payload.outcome === -1, "outcome must be 1 (successful delivery) or -1 (problematic order).");

  if (payload.phoneNumber !== undefined || payload.countryCode !== undefined || payload.postalCode !== undefined || payload.addressLine !== undefined) {
    assert(typeof payload.phoneNumber === "string" && PHONE_PATTERN.test(payload.phoneNumber), "phoneNumber must be in E.164 format when extended fields are used.");
    assert(typeof payload.countryCode === "string" && /^[A-Z]{2}$/.test(payload.countryCode), "countryCode must be a two-letter ISO country code when extended fields are used.");
    assert(typeof payload.postalCode === "string" && payload.postalCode.trim().length > 0, "postalCode is required when extended fields are used.");
    assert(typeof payload.addressLine === "string" && payload.addressLine.trim().length > 0, "addressLine is required when extended fields are used.");
  }

  if (payload.amount !== undefined) {
    assert(Number.isFinite(payload.amount) && payload.amount >= 0, "amount must be a non-negative number.");
  }

  if (payload.currency !== undefined) {
    assert(/^[A-Z]{3}$/.test(String(payload.currency).toUpperCase()), "currency must be a three-letter ISO code.");
  }

  return payload;
}

export function stripUnknownFields(payload, allowedFields) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => allowedFields.includes(key)));
}
