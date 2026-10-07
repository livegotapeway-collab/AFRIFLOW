const BASE_URL = process.env.AIRTEL_BASE_URL || "https://openapiuat.airtel.africa";
const COUNTRY = process.env.AIRTEL_COUNTRY || "CD";
const CURRENCY = process.env.AIRTEL_CURRENCY || "CDF";

export function normalizePhone(value: string) {
  const digits = value.replace(/\\D/g, "");
  if (digits.startsWith("243")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

async function getToken() {
  const clientId = process.env.AIRTEL_CLIENT_ID;
  const clientSecret = process.env.AIRTEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Identifiants Airtel Money non configurés.");

  const response = await fetch(BASE_URL + "/auth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.message || "Authentification Airtel impossible.");
  return data.access_token as string;
}

export async function requestPayment(input: { reference: string; phone: string; amount: number }) {
  const token = await getToken();
  const msisdn = normalizePhone(input.phone);
  if (msisdn.length < 9 || msisdn.length > 12) throw new Error("Numéro Airtel Money invalide.");

  const response = await fetch(BASE_URL + "/merchant/v2/payments/" + COUNTRY, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Country": COUNTRY,
      "X-Currency": CURRENCY,
    },
    body: JSON.stringify({
      reference: input.reference,
      subscriber: { country: COUNTRY, currency: CURRENCY, msisdn },
      transaction: { amount: String(input.amount), country: COUNTRY, currency: CURRENCY, id: input.reference, type: "MerchantPayment" },
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error?.message || "Airtel Money a refusé la demande.");
  return data;
}
