"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function ResetPassword() {
  const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  async function send(){const e=email.trim();if(!e||!e.includes("@"))return setMessage("Entrez une adresse email valide.");setLoading(true);setMessage("");const supabase=createClient();const {error}=await supabase.auth.resetPasswordForEmail(e,{redirectTo:window.location.origin+"/auth/update-password"});setLoading(false);setMessage(error?error.message:"Si cette adresse possède un compte, un email de réinitialisation a été envoyé.");}
  return <main><nav><Link href="/"><b>AFRIFLOW</b></Link><Link href="/auth">Connexion</Link></nav><section className="auth"><span className="badge">SÉCURITÉ</span><h1>Réinitialiser le mot de passe</h1><p className="muted">Entrez votre email pour recevoir un lien de réinitialisation.</p><label className="field-label">Email<input type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="button full" onClick={send} disabled={loading}>{loading?"Envoi…":"Envoyer le lien"}</button>{message&&<p className="notice">{message}</p>}<Link className="forgot-link" href="/auth">← Retour à la connexion</Link></section></main>;
}