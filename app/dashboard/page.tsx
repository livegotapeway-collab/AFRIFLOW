"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Order = {
  id: string;
  product_id: string;
  amount_cdf: number;
  status: string;
  created_at: string;
  productName?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      setEmail(user.email ?? "");

      const { data: orderRows } = await supabase
        .from("orders")
        .select("id,product_id,amount_cdf,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const rows = orderRows ?? [];
      if (rows.length) {
        const ids = [...new Set(rows.map((row) => row.product_id))];
        const { data: products } = await supabase
          .from("products")
          .select("id,name")
          .in("id", ids);

        const names = new Map((products ?? []).map((product) => [product.id, product.name]));
        setOrders(rows.map((row) => ({ ...row, productName: names.get(row.product_id) })));
      } else {
        setOrders([]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  if (loading) {
    return <main><section className="content narrow"><p>Chargement de votre compte…</p></section></main>;
  }

  return (
    <main>
      <nav>
        <Link href="/"><b>AFRIFLOW</b></Link>
        <div><Link href="/products">Acheter un kit</Link><button className="nav-button" onClick={logout}>Déconnexion</button></div>
      </nav>
      <section className="content narrow">
        <span className="badge">ESPACE CLIENT</span>
        <h1>Bienvenue sur AFRIFLOW</h1>
        <p>Connecté avec : <strong>{email}</strong></p>
        <h2>Mes commandes</h2>
        {orders.length === 0 ? (
          <p className="muted">Aucune commande pour le moment.</p>
        ) : (
          <div className="cards">
            {orders.map((order) => (
              <article key={order.id}>
                <strong>{order.productName ?? "Kit numérique"}</strong>
                <p>{new Intl.NumberFormat("fr-FR").format(order.amount_cdf)} CDF</p>
                <p>Statut : <strong>{order.status === "paid" ? "Payée" : order.status === "pending" ? "En attente de paiement" : order.status}</strong></p>
                {order.status === "paid" && <button className="secondary" disabled>Télécharger le kit</button>}
                <small>{new Date(order.created_at).toLocaleString("fr-FR")}</small>
              </article>
            ))}
          </div>
        )}
        <p className="muted">Paiement : Mobile Money uniquement. Le téléchargement sécurisé sera activé dès que le paiement est confirmé.</p>
        <Link className="button" href="/products">Découvrir les kits</Link>
      </section>
    </main>
  );
}
