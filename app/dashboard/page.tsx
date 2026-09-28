"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace("/auth");
        return;
      }
      setEmail(data.user.email ?? "");
      setLoading(false);
    });
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
        <p>Votre espace client est actif. Vos achats et téléchargements apparaîtront ici après paiement.</p>
        <Link className="button" href="/products">Découvrir les kits</Link>
      </section>
    </main>
  );
}
