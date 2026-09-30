import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav>
        <Link href="/"><b>AFRIFLOW</b></Link>
        <div><Link href="/products">Kits</Link><Link href="/auth">Mon compte</Link></div>
      </nav>

      <section className="hero">
        <span className="badge">🌍 AFRIQUE FRANCOPHONE · MOBILE FIRST</span>
        <h1>Des outils numériques.<br /><em>Pour passer à l’action.</em></h1>
        <p>Des kits pratiques pour vendre, lancer une activité et gagner du temps. Pensés pour les réalités de la RDC et des marchés francophones.</p>
        <div className="actions">
          <Link className="button" href="/products">Voir les kits</Link>
          <Link className="secondary" href="/auth">Créer mon compte</Link>
        </div>
        <div className="trust-row">
          <span>✓ Utilisable sur téléphone</span><span>✓ Contenu prêt à l’emploi</span><span>✓ Compte client personnel</span>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading"><span className="badge">COMMENT ÇA MARCHE</span><h2>Simple du début à l’utilisation</h2></div>
        <div className="steps">
          <article><span>01</span><h3>Choisissez</h3><p>Parcourez les kits et ouvrez la fiche du produit qui vous intéresse.</p></article>
          <article><span>02</span><h3>Commandez</h3><p>Connectez-vous et créez votre commande depuis votre téléphone.</p></article>
          <article><span>03</span><h3>Utilisez</h3><p>Retrouvez vos commandes dans votre espace client. Les téléchargements seront activés avec les fichiers publiés.</p></article>
        </div>
      </section>

      <section className="cards home-cards">
        <article><strong>🇨🇩 RDC</strong><h3>Conçu localement</h3><p>Des exemples, prix et méthodes adaptés au contexte africain francophone.</p></article>
        <article><strong>⚡ PRATIQUE</strong><h3>Prêt à utiliser</h3><p>Moins de théorie, plus de modèles, scripts, checklists et ressources concrètes.</p></article>
        <article><strong>📱 MOBILE</strong><h3>Depuis votre téléphone</h3><p>Catalogue, compte et commandes accessibles sans ordinateur.</p></article>
      </section>

      <section className="cta">
        <h2>Commencez avec votre premier kit.</h2>
        <p>Créez votre compte gratuitement et explorez le catalogue AFRIFLOW.</p>
        <Link className="button" href="/products">Découvrir AFRIFLOW</Link>
      </section>
    </main>
  );
}