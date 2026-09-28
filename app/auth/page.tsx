"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(signup: boolean) {
    setMsg("Chargement…");
    const supabase = createClient();
    const result = signup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMsg(result.error.message);
      return;
    }

    if (signup) {
      setMsg("Compte créé. Vérifiez votre email si la confirmation est activée.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main>
      <nav>
        <Link href="/"><b>AFRIFLOW</b></Link>
        <Link href="/products">Kits</Link>
      </nav>
      <section className="auth">
        <span className="badge">MON COMPTE</span>
        <h1>Commencer avec AFRIFLOW</h1>
        <input type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="button" onClick={() => submit(false)}>Se connecter</button>
        <button className="secondary full" onClick={() => submit(true)}>Créer un compte</button>
        {msg && <p className="notice">{msg}</p>}
      </section>
    </main>
  );
}
