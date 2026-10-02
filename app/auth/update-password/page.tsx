"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
  }, []);

  async function update() {
    if (password.length < 8) return setMessage("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setMessage("Les mots de passe ne correspondent pas.");
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setMessage(error.message);
    setMessage("Mot de passe mis à jour. Redirection vers votre compte…");
    setTimeout(() => router.push("/dashboard"), 900);
  }

  return <main><nav><Link href="/"><b>AFRIFLOW</b></Link><Link href="/auth">Connexion</Link></nav><section className="auth"><span className="badge">SÉCURITÉ</span><h1>Nouveau mot de passe</h1><p className="muted">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>{ready ? <><label className="field-label">Nouveau mot de passe<input type="password" autoComplete="new-password" placeholder="8 caractères minimum" value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="field-label">Confirmer le mot de passe<input type="password" autoComplete="new-password" placeholder="Répétez le mot de passe" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="button full" onClick={update} disabled={loading}>{loading?"Mise à jour…":"Enregistrer le nouveau mot de passe"}</button></> : <p className="notice">Lien de réinitialisation invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.</p>}{message&&<p className="notice">{message}</p>}<Link className="forgot-link" href="/auth">← Retour à la connexion</Link></section></main>;
}