import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { dueReviews, useStore } from '../lib/store'

export function Plus() {
  const { state } = useStore()
  const due = dueReviews(state).length
  const items: [string, string, string, string][] = [
    ['/aujourdhui', 'home', 'Plan du jour', 'Vocabulaire, exercice oral et image du jour, compte à rebours'],
    ['/simulation', 'timer', "Simulation d'examen", 'Entretien + image, chronométrés'],
    ['/image', 'image', "Description d'image", 'Choisir une image parmi trois et la décrire'],
    ['/revisions', 'check', 'Révisions', due ? `${due} question${due > 1 ? 's' : ''} à revoir aujourd'hui` : 'Rien à revoir aujourd’hui'],
    ['/grammaire', 'blocks', 'Grammaire', 'Fiche de déconstruction : 18 phrases'],
    ['/progression', 'chart', 'Ma progression', 'Jours d’affilée, minutes parlées, thèmes'],
    ['/reglages', 'settings', 'Réglages', 'Examen, affichage, micro, données'],
  ]
  return (
    <>
      <h1>Plus</h1>
      <nav className="menu" aria-label="Autres modules">
        {items.map(([to, icon, t, s]) => (
          <Link key={to} to={to}><Icon name={icon} /><span><b>{t}</b><small>{s}</small></span></Link>
        ))}
        <div className="menu-item" style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.75 }}>
          <Icon name="headphones" />
          <span><b>Compréhension orale (B1)</b><small style={{ display: 'block', color: 'var(--muted)', fontSize: '.85rem' }}>Bientôt : nécessite des audios de locuteurs natifs</small></span>
        </div>
      </nav>
    </>
  )
}
