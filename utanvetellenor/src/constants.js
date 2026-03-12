export const DEFAULT_TIMEOUT_MS = 10_000;

export const BASE_URLS = {
  production: "https://www.utanvet-ellenor.hu",
  sandbox: "https://sandbox.utanvet-ellenor.hu"
};

export const ENDPOINTS = {
  request: "/api/v2/request",
  signal: "/api/v2/signal"
};

export const STATUS_CODES = {
  0: "Success",
  1: "Missing required parameter",
  2: "Missing authentication credentials",
  3: "Invalid authentication credentials",
  4: "Merchant not authorized",
  5: "Too many requests",
  6: "Invalid request body",
  7: "Temporarily unavailable"
};

export const REASON_CODES = {
  1: "neutral",
  2: "good_history",
  3: "bad_history",
  4: "high_risk",
  5: "manual_review",
  6: "email_risk",
  7: "address_risk",
  8: "phone_risk"
};

export const REASON_DESCRIPTIONS = {
  neutral: "Neutral result.",
  good_history: "Customer history suggests low risk.",
  bad_history: "Customer history suggests elevated risk.",
  high_risk: "The order appears high-risk.",
  manual_review: "Manual review is recommended.",
  email_risk: "The email address is considered risky.",
  address_risk: "The address is considered risky.",
  phone_risk: "The phone number is considered risky."
};

export const REPUTATION_LABELS = {
  good: "good",
  bad: "bad",
  unknown: "unknown"
};

export const REQUEST_FIELDS = [
  "email",
  "phoneNumber",
  "countryCode",
  "postalCode",
  "addressLine",
  "orderId",
  "threshold",
  "amount",
  "currency",
  "ipAddress",
  "userAgent",
  "metadata"
];

export const SIGNAL_FIELDS = [
  "email",
  "phoneNumber",
  "countryCode",
  "postalCode",
  "addressLine",
  "orderId",
  "outcome",
  "amount",
  "currency",
  "metadata"
];

export const CONFIG_KEYS = ["publicKey", "privateKey", "sandbox", "timeoutMs"];

export const REQUEST_TEMPLATE = {
  email: "customer@example.com",
  phoneNumber: "+36301234567",
  countryCode: "HU",
  postalCode: "1117",
  addressLine: "Example utca 1.",
  orderId: "ORDER-10001",
  threshold: 0.8,
  amount: 19990,
  currency: "HUF",
  ipAddress: "203.0.113.10",
  userAgent: "Mozilla/5.0",
  metadata: {
    shop: "webshop-name"
  }
};

export const SIGNAL_TEMPLATE = {
  email: "customer@example.com",
  phoneNumber: "+36301234567",
  countryCode: "HU",
  postalCode: "1117",
  addressLine: "Example utca 1.",
  orderId: "ORDER-10001",
  outcome: -1,
  amount: 19990,
  currency: "HUF",
  metadata: {
    note: "Chargeback"
  }
};

export const ENV_KEYS = {
  publicKey: "UVE_PUBLIC_KEY",
  privateKey: "UVE_PRIVATE_KEY",
  sandbox: "UVE_SANDBOX",
  timeoutMs: "UVE_TIMEOUT_MS"
};
