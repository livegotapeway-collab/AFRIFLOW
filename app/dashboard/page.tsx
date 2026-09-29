"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Order = {
  id: string;
  amount_cdf: number;
  status: string;
  created_at: string;
  products: { name: string; slug: string } | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/auth");
        return;
      }

      setEmail(userData.user.email ?? "");

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("id,amount_cdf,status,created_at,products(name,slug)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        setError("Impossible de charger vos commandes.");
      } else {
        setOrders((data ?? []) as Order[]);
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
        {error && <p className="notice">{error}</p>}
        {!error && orders.length === 0 && <p className="notice">Vous n’avez encore aucune commande.</p>}
        {orders.map((order) => (
          <article className="product" key={order.id}>
            <h3>{order.products?.name ?? "Kit numérique"}</h3>
            <p>{new Intl.NumberFormat("fr-FR").format(order.amount_cdf)} CDF</p>
            <p>Statut : <strong>{order.status === "paid" ? "Payé" : "En attente"}</strong></p>
            <p className="notice">{order.status === "paid" ? "Paiement confirmé. Le téléchargement sécurisé sera disponible après activation du paiement." : "Paiement Mobile Money en attente."}</p>
          </article>
        ))}
        <Link className="button" href="/products">Découvrir les kits</Link>
      </section>
    </main>
  );
}
