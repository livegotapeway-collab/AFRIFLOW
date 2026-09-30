"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Product = { id: string; name: string; slug: string; description: string | null; price_cdf: number };

export default function ProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.description ?? ""].join(" ").toLowerCase().includes(q));
  }, [products, query]);

  return (
    <>
      <div className="catalog-toolbar">
        <input aria-label="Rechercher un kit" placeholder="Rechercher un kit…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <span>{filtered.length} kit{filtered.length > 1 ? "s" : ""}</span>
      </div>
      <div className="grid">
        {filtered.map((p) => (
          <article className="product" key={p.id}>
            <div className="product-top"><div className="icon">📦</div><span className="mini-badge">DIGITAL</span></div>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <div className="product-bottom">
              <strong>{new Intl.NumberFormat("fr-FR").format(p.price_cdf)} CDF</strong>
              <Link className="button" href={"/products/" + p.slug}>Voir le kit</Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <p className="notice">Aucun kit ne correspond à votre recherche.</p>}
    </>
  );
}