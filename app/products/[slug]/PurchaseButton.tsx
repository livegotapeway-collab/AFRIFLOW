"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function buy() {
    const phone = window.prompt("Entrez votre numéro Airtel Money (ex. 0971234567)");
    if (!phone) return;
    setLoading(true);
    setMessage("");
    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }),
      });
      const orderData = await orderResponse.json();
      if (orderResponse.status === 401) { router.push("/auth"); return; }
      if (!orderResponse.ok || !orderData.order?.id) { setMessage(orderData.error || "Impossible de créer la commande."); return; }

      const paymentResponse = await fetch("/api/payments/airtel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id, phone }),
      });
      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) { setMessage(paymentData.error || "Paiement Airtel Money impossible."); return; }
      router.push("/orders/" + orderData.order.id);
      router.refresh();
    } catch {
      setMessage("Erreur de connexion. Réessayez.");
    } finally { setLoading(false); }
  }

  return <div>
    <button className="button" onClick={buy} disabled={loading}>{loading ? "Connexion Airtel…" : "Payer avec Airtel Money"}</button>
    {message && <p className="notice">{message}</p>}
  </div>;
}
