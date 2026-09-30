import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: order } = await supabase
    .from("orders")
    .select("id,product_id,amount_cdf,status,created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const { data: product } = await supabase
    .from("products")
    .select("name,slug,description")
    .eq("id", order.product_id)
    .single();

  const status = order.status === "paid"
    ? "Payée"
    : order.status === "pending"
      ? "En attente"
      : order.status;

  return (
    <main>
      <nav>
        <Link href="/dashboard"><b>← Mon espace</b></Link>
        <Link href="/products">Acheter un kit</Link>
      </nav>
      <section className="content narrow">
        <span className="badge">DÉTAIL DE LA COMMANDE</span>
        <h1>{product?.name ?? "Kit numérique"}</h1>
        <div className="order-detail">
          <div><span>Référence</span><strong>{order.id.slice(0, 8).toUpperCase()}</strong></div>
          <div><span>Montant</span><strong>{new Intl.NumberFormat("fr-FR").format(order.amount_cdf)} CDF</strong></div>
          <div><span>Statut</span><strong>{status}</strong></div>
          <div><span>Date</span><strong>{new Date(order.created_at).toLocaleString("fr-FR")}</strong></div>
        </div>
        <p>{product?.description ?? "Votre kit numérique AFRIFLOW."}</p>
        {order.status === "paid" ? (
          <div className="notice">Votre commande est payée. Le téléchargement sécurisé sera disponible lorsque le fichier du produit sera publié.</div>
        ) : (
          <div className="notice">Cette commande est enregistrée. Le paiement Mobile Money sera activé dans une prochaine étape.</div>
        )}
        <div className="actions">
          {product?.slug && <Link className="secondary" href={"/products/" + product.slug}>Voir le kit</Link>}
          <Link className="button" href="/dashboard">Retour au compte</Link>
        </div>
      </section>
    </main>
  );
}
