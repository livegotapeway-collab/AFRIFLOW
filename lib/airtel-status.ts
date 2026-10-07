const BASE_URL = process.env.AIRTEL_BASE_URL || "https://openapiuat.airtel.africa";
const COUNTRY = process.env.AIRTEL_COUNTRY || "CD";
const CURRENCY = process.env.AIRTEL_CURRENCY || "CDF";

export async function getPaymentStatus(transactionId: string) {
  const clientId = process.env.AIRTEL_CLIENT_ID;
  const clientSecret = process.env.AIRTEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Identifiants Airtel Money non configurés.");
  const tokenResponse = await fetch(BASE_URL + "/auth/oauth2/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }), cache: "no-store" });
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) throw new Error("Authentification Airtel impossible.");
  const response = await fetch(BASE_URL + "/standard/v1/payments/" + encodeURIComponent(transactionId), { headers: { Authorization: "Bearer " + tokenData.access_token, Accept: "application/json", "X-Country": COUNTRY, "X-Currency": CURRENCY }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("Statut Airtel indisponible.");
  return data;
}
