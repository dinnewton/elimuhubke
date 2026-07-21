import "server-only";

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export const mpesaMockMode = !process.env.MPESA_CONSUMER_KEY;

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  if (!res.ok) {
    throw new Error(`M-Pesa auth failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

function fakeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type StkPushParams = {
  phone: string; // 2547XXXXXXXX format
  amountKES: number;
  accountReference: string;
  transactionDesc: string;
};

export type StkPushResult = {
  checkoutRequestId: string;
  merchantRequestId: string;
};

// Lipa Na M-Pesa Online (STK Push) — prompts the customer's phone for their PIN.
export async function initiateStkPush(
  params: StkPushParams
): Promise<StkPushResult> {
  if (mpesaMockMode) {
    return {
      checkoutRequestId: fakeId("ws_CO_MOCK"),
      merchantRequestId: fakeId("MOCK"),
    };
  }

  const accessToken = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(params.amountKES)),
      PartyA: params.phone,
      PartyB: shortcode,
      PhoneNumber: params.phone,
      CallBackURL: process.env.MPESA_STK_CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(`STK push failed: ${JSON.stringify(data)}`);
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  };
}

export type B2CParams = {
  phone: string;
  amountKES: number;
  remarks: string;
  occasion: string;
};

export type B2CResult = {
  conversationId: string;
  originatorConversationId: string;
};

// Business-to-Customer payment — used for weekly teacher payouts.
export async function initiateB2CPayment(params: B2CParams): Promise<B2CResult> {
  if (mpesaMockMode) {
    return {
      conversationId: fakeId("AG_MOCK"),
      originatorConversationId: fakeId("MOCK"),
    };
  }

  const accessToken = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/b2c/v3/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_INITIATOR_PASSWORD,
      CommandID: "BusinessPayment",
      Amount: Math.max(1, Math.round(params.amountKES)),
      PartyA: process.env.MPESA_B2C_SHORTCODE,
      PartyB: params.phone,
      Remarks: params.remarks,
      QueueTimeOutURL: process.env.MPESA_B2C_TIMEOUT_URL,
      ResultURL: process.env.MPESA_B2C_RESULT_URL,
      Occasion: params.occasion,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(`B2C payment failed: ${JSON.stringify(data)}`);
  }

  return {
    conversationId: data.ConversationID,
    originatorConversationId: data.OriginatorConversationID,
  };
}
