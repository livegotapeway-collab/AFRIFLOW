import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,name,slug,price_cdf,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id,amount_cdf,status")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOrder) {
    return NextResponse.json({
      order: existingOrder,
      paymentReady: false,
      message: "Vous avez déjà une commande en attente pour ce kit.",
    });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      product_id: product.id,
      amount_cdf: product.price_cdf,
      status: "pending",
    })
    .select("id,amount_cdf,status")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Commande impossible." }, { status: 500 });
  }

  return NextResponse.json({
    order,
    paymentReady: false,
    message: "Commande créée. Paiement Mobile Money à configurer.",
  });
}
