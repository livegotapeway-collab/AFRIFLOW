import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { createAdminClient } from "../../../../../lib/admin";
import { getPaymentStatus } from "../../../../../lib/airtel-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("orderId");
  if (!id) return NextResponse.json({ error: "orderId requis." }, { status: 400 });

  const { data: order } = await supabase.from("orders").select("id,status,airtel_transaction_id").eq("id", id).eq("user_id", user.id).single();
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (!order.airtel_transaction_id) return NextResponse.json({ status: order.status });

  try {
    const result = await getPaymentStatus(order.airtel_transaction_id);
    const remote = String(result?.data?.transaction?.status || result?.data?.status || result?.transaction?.status || result?.status || "").toLowerCase();
    const nextStatus = remote === "successful" || remote === "success" ? "paid" : remote === "failed" || remote === "failure" ? "failed" : "pending";
    if (nextStatus !== order.status) {
      const admin = createAdminClient();
      await admin.from("orders").update({ status: nextStatus }).eq("id", order.id).eq("user_id", user.id);
    }
    return NextResponse.json({ status: nextStatus, airtelStatus: remote });
  } catch {
    return NextResponse.json({ status: order.status });
  }
}
