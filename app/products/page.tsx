import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import ProductCatalog from "./ProductCatalog";

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
        <div><Link href="/products">Kits</Link><Link href="/auth">Mon compte</Link></div>
      </nav>
      <section className="content">
        <span className="badge">KITS NUMÉRIQUES</span>
        <h1>Des outils pour passer à l’action</h1>
        <p>Des ressources pratiques, pensées pour être utilisées directement depuis votre téléphone.</p>
        {error ? <p className="notice">Le catalogue est temporairement indisponible.</p> : <ProductCatalog products={products ?? []} />}
      </section>
    </main>
  );
}