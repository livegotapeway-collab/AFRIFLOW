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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("RDC");
  const [newPassword, setNewPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      setEmail(user.email ?? "");
      setName(user.user_metadata?.full_name ?? "");
      setPhone(user.user_metadata?.phone ?? "");
      setCountry(user.user_metadata?.country ?? "RDC");

      const { data: orderRows } = await supabase
        .from("orders")
        .select("id,product_id,amount_cdf,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const rows = orderRows ?? [];
      if (rows.length) {
        const ids = [...new Set(rows.map((row) => row.product_id))];
        const { data: products } = await supabase.from("products").select("id,name").in("id", ids);
        const names = new Map((products ?? []).map((product) => [product.id, product.name]));
        setOrders(rows.map((row) => ({ ...row, productName: names.get(row.product_id) })));
      } else {
        setOrders([]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), phone: phone.trim(), country },
    });
    setSaving(false);
    setMessage(error ? error.message : "Profil enregistré.");
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      setMessage("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setNewPassword("");
    setMessage("Mot de passe mis à jour.");
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  if (loading) {
    return <main><section className="content narrow"><p>Chargement de votre compte…</p></section></main>;
  }

  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <main>
      <nav>
        <Link href="/"><b>AFRIFLOW</b></Link>
        <div><Link href="/products">Acheter un kit</Link><button className="nav-button" onClick={logout}>Déconnexion</button></div>
      </nav>

      <section className="content">
        <span className="badge">ESPACE CLIENT</span>
        <h1>Mon espace AFRIFLOW</h1>
        <p>Gérez votre profil, vos commandes et la sécurité de votre compte depuis votre téléphone.</p>

        <div className="stats">
          <article><strong>{orders.length}</strong><span>Commandes</span></article>
          <article><strong>{paid}</strong><span>Payées</span></article>
          <article><strong>{pending}</strong><span>En attente</span></article>
        </div>

        <div className="settings-grid">
          <section className="settings-card">
            <h2>Mon profil</h2>
            <p className="muted">Ces informations servent à personnaliser votre compte.</p>
            <label>Nom complet<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" /></label>
            <label>Téléphone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 ..." /></label>
            <label>Pays<select value={country} onChange={(e) => setCountry(e.target.value)}><option>RDC</option><option>Côte d’Ivoire</option><option>Sénégal</option><option>Cameroun</option><option>Autre</option></select></label>
            <label>Email<input value={email} disabled /></label>
            <button className="button" onClick={saveProfile} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer le profil"}</button>
          </section>

          <section className="settings-card">
            <h2>Sécurité</h2>
            <p className="muted">Renforcez l’accès à votre compte AFRIFLOW.</p>
            <label>Nouveau mot de passe<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8 caractères minimum" /></label>
            <button className="secondary" onClick={changePassword} disabled={saving}>Modifier le mot de passe</button>
            <div className="security-note">Votre session reste protégée par l’authentification AFRIFLOW.</div>
          </section>
        </div>

        {message && <p className="notice">{message}</p>}

        <h2>Mes commandes</h2>
        {orders.length === 0 ? (
          <p className="muted">Aucune commande pour le moment.</p>
        ) : (
          <div className="cards">
            {orders.map((order) => (
              <article key={order.id}>
                <strong><Link href={"/orders/" + order.id}>{order.productName ?? "Kit numérique"}</Link></strong>
                <p>{new Intl.NumberFormat("fr-FR").format(order.amount_cdf)} CDF</p>
                <p>Statut : <strong>{order.status === "paid" ? "Payée" : order.status === "pending" ? "En attente de paiement" : order.status}</strong></p>
                {order.status === "paid" && <button className="secondary" disabled>Télécharger le kit</button>}
                <small>{new Date(order.created_at).toLocaleString("fr-FR")}</small>
              </article>
            ))}
          </div>
        )}
        <p className="muted">Le téléchargement sécurisé sera activé dès que le paiement et les fichiers produits seront configurés.</p>
        <Link className="button" href="/products">Découvrir les kits</Link>
      </section>
    </main>
  );
}
