import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/admin";
import { requestPayment } from "../../../../lib/airtel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const phone = typeof body?.phone === "string" ? body.phone : "";
  if (!orderId || !phone) return NextResponse.json({ error: "Commande et numéro Airtel requis." }, { status: 400 });

  const { data: order, error } = await supabase.from("orders").select("id,amount_cdf,status").eq("id", orderId).eq("user_id", user.id).single();
  if (error || !order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (order.status === "paid") return NextResponse.json({ error: "Cette commande est déjà payée." }, { status: 409 });

  const reference = "AFRIFLOW-" + order.id.replaceAll("-", "").slice(0, 20).toUpperCase();
  try {
    const result = await requestPayment({ reference, phone, amount: order.amount_cdf });
    const transactionId = result?.data?.transaction?.id || result?.data?.transactionId || result?.transaction?.id || result?.transactionId || reference;
    const admin = createAdminClient();
    await admin.from("orders").update({ airtel_transaction_id: transactionId }).eq("id", order.id).eq("user_id", user.id);
    return NextResponse.json({ ok: true, orderId: order.id, transactionId, message: "Demande de paiement Airtel Money envoyée. Validez-la sur votre téléphone." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Paiement Airtel Money impossible.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
