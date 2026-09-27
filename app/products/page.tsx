import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Products() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,description,price_cdf")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <main>
      <nav>
        <Link href="/"><b>AFRIFLOW</b></Link>
        <Link href="/auth">Mon compte</Link>
      </nav>
      <section className="content">
        <span className="badge">KITS NUMÉRIQUES</span>
        <h1>Choisissez votre kit</h1>
        <p>Des ressources conçues pour être utilisées depuis votre téléphone.</p>

        {error ? (
          <p className="notice">Le catalogue est temporairement indisponible.</p>
        ) : (
          <div className="grid">
            {(products ?? []).map((p) => (
              <article className="product" key={p.id}>
                <div className="icon">📦</div>
                <h2>{p.name}</h2>
                <p>{p.description}</p>
                <strong>{new Intl.NumberFormat("fr-FR").format(p.price_cdf)} CDF</strong>
                <Link className="button" href={"/products/" + p.slug}>Voir le kit</Link>
              </article>
            ))}
          </div>
        )}

        {!error && (products ?? []).length === 0 && (
          <p className="notice">Aucun produit disponible pour le moment.</p>
        )}
      </section>
    </main>
  );
}