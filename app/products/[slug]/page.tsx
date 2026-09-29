import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import PurchaseButton from "./PurchaseButton";

export const dynamic = "force-dynamic";

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,slug,description,price_cdf")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) notFound();

  return (
    <main>
      <nav>
        <Link href="/products"><b>← AFRIFLOW</b></Link>
        <Link href="/auth">Mon compte</Link>
      </nav>
      <section className="content narrow">
        <div className="icon big">📦</div>
        <span className="badge">KIT NUMÉRIQUE · MOBILE MONEY</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <div className="buy">
          <strong>{new Intl.NumberFormat("fr-FR").format(product.price_cdf)} CDF</strong>
          <PurchaseButton slug={product.slug} />
        </div>
        <p className="muted">Vous devez être connecté pour créer votre commande. Le paiement Mobile Money sera branché à l’étape CinetPay.</p>
      </section>
    </main>
  );
}