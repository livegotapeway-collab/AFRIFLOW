"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function buy() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/auth");
        return;
      }
      if (!response.ok) {
        setMessage(data.error || "Impossible de créer la commande.");
        return;
      }
      setMessage("Commande créée. Le paiement Mobile Money sera activé prochainement.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="button" onClick={buy} disabled={loading}>
        {loading ? "Création…" : "Acheter avec Mobile Money"}
      </button>
      {message && <p className="notice">{message}</p>}
    </div>
  );
}
