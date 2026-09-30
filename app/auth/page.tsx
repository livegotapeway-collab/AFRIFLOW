"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) return setMsg("Entrez une adresse email valide.");
    if (password.length < 8) return setMsg("Le mot de passe doit contenir au moins 8 caractères.");
    setLoading(true); setMsg("");
    const supabase = createClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email: cleanEmail, password })
      : await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setLoading(false);
    if (result.error) return setMsg(result.error.message);
    if (mode === "signup") {
      setMsg("Compte créé. Vérifiez votre email si la confirmation est activée.");
      setMode("login"); setPassword(""); return;
    }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main>
      <nav><Link href="/"><b>AFRIFLOW</b></Link><Link href="/products">Kits</Link></nav>
      <section className="auth">
        <span className="badge">MON COMPTE</span>
        <h1>{mode === "login" ? "Bienvenue sur AFRIFLOW" : "Créer mon compte"}</h1>
        <p className="muted">{mode === "login" ? "Retrouvez vos commandes et votre profil." : "Un espace personnel pour vos commandes AFRIFLOW."}</p>
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setMsg("");}}>Connexion</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setMsg("");}}>Inscription</button>
        </div>
        <label className="field-label">Email
          <input type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="field-label">Mot de passe
          <div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Masquer" : "Voir"}</button></div>
        </label>
        <button className="button full" onClick={submit} disabled={loading}>{loading ? "Traitement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
        {mode === "login" && <Link className="forgot-link" href="/auth/reset">Mot de passe oublié ?</Link>}
        {msg && <p className="notice">{msg}</p>}
      </section>
    </main>
  );
}