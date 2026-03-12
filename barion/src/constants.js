export const DEFAULT_TIMEOUT_MS = 15_000;

export const BASE_URLS = {
  production: "https://api.barion.com",
  sandbox: "https://api.test.barion.com"
};

export const ENDPOINTS = {
  start: { method: "POST", path: "/v2/Payment/Start" },
  state: { method: "GET", path: "/v4/payment/{PaymentId}/paymentstate" },
  complete: { method: "POST", path: "/v2/Payment/Complete" },
  finishReservation: { method: "POST", path: "/v2/Payment/FinishReservation" },
  capture: { method: "POST", path: "/v2/Payment/Capture" },
  cancelAuthorization: { method: "POST", path: "/v2/Payment/CancelAuthorization" },
  refund: { method: "POST", path: "/v2/Payment/Refund" }
};

export const CONFIG_KEYS = ["posKey", "sandbox", "timeoutMs", "baseUrl"];

export const ENV_KEYS = {
  posKey: "BARION_POS_KEY",
  sandbox: "BARION_SANDBOX",
  timeoutMs: "BARION_TIMEOUT_MS",
  baseUrl: "BARION_BASE_URL"
};

export const COMMAND_ALIASES = {
  "finish-reservation": "finishReservation",
  "cancel-authorization": "cancelAuthorization"
};

export const START_TEMPLATE = {
  PaymentType: "Immediate",
  GuestCheckOut: true,
  FundingSources: ["All"],
  PaymentRequestId: "BARION-CLI-START-001",
  PayerHint: "customer@example.com",
  Locale: "hu-HU",
  Currency: "HUF",
  RedirectUrl: "https://merchant.example.com/barion/redirect",
  CallbackUrl: "https://merchant.example.com/api/barion/callback",
  Transactions: [
    {
      POSTransactionId: "ORDER-10001",
      Payee: "merchant@example.com",
      Total: 19990,
      Items: [
        {
          Name: "Test Product",
          Description: "Barion CLI sample item",
          Quantity: 1,
          Unit: "db",
          UnitPrice: 19990,
          ItemTotal: 19990,
          SKU: "SKU-10001"
        }
      ]
    }
  ]
};

export const COMPLETE_TEMPLATE = {
  PaymentId: "11111111111111118111111111111111"
};

export const FINISH_RESERVATION_TEMPLATE = {
  PaymentId: "11111111111111118111111111111111",
  Transactions: [
    {
      TransactionId: "22222222-2222-4222-8222-222222222222",
      Total: 19990,
      Comment: "Ship and finalize reserved payment"
    }
  ]
};

export const CAPTURE_TEMPLATE = {
  PaymentId: "11111111111111118111111111111111",
  Transactions: [
    {
      TransactionId: "22222222-2222-4222-8222-222222222222",
      Total: 19990,
      Comment: "Capture authorized amount"
    }
  ]
};

export const CANCEL_AUTHORIZATION_TEMPLATE = {
  PaymentId: "11111111111111118111111111111111"
};

export const REFUND_TEMPLATE = {
  PaymentId: "11111111111111118111111111111111",
  TransactionsToRefund: [
    {
      TransactionId: "22222222-2222-4222-8222-222222222222",
      POSTransactionId: "ORDER-10001",
      AmountToRefund: 19990,
      Comment: "Customer refund"
    }
  ]
};

export const STATE_TEMPLATE = {
  paymentId: "11111111111111118111111111111111"
};

export const TEMPLATE_BY_COMMAND = {
  start: START_TEMPLATE,
  state: STATE_TEMPLATE,
  complete: COMPLETE_TEMPLATE,
  finishReservation: FINISH_RESERVATION_TEMPLATE,
  capture: CAPTURE_TEMPLATE,
  cancelAuthorization: CANCEL_AUTHORIZATION_TEMPLATE,
  refund: REFUND_TEMPLATE
};
