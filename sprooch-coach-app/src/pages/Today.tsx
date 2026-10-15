// Accueil : plan du jour (PRD §6) et compte à rebours avant l'examen (PRD §4.6).
import { Link } from 'react-router-dom'
import { ALL_QUESTIONS, CHAPTERS, FAMILIES } from '../data'
import { Icon } from '../components/Icon'
import { Rings } from '../components/Rings'
import { dayKey, daysBetween, formatDate } from '../lib/dates'
import { dueReviews, isUnlocked, qStatus, useProgress, useStore, type AppState } from '../lib/store'

function nextQuestionChapter(state: AppState): number | null {
  for (const c of CHAPTERS) {
    if (!isUnlocked(state, c.index)) continue
    if (c.qs.some(q => qStatus(state, q.id) === 'voir')) return c.index
  }
  return null
}

/** La famille à travailler aujourd'hui : la première pas encore validée, dans l'ordre du lexique. */
function weakestVocab(state: AppState): { key: string; label: string; mode: 'mot' | 'phrase' } {
  for (const f of FAMILIES) {
    const sc = state.vocab[f.key] ?? {}
    if ((sc.mot ?? 0) < 80) return { key: f.key, label: f.label, mode: 'mot' }
    if (f.phrases.length && (sc.phrase ?? 0) < 80) return { key: f.key, label: f.label, mode: 'phrase' }
  }
  // Tout est validé : on révise la famille qui a le plus de mots à revoir.
  const f = [...FAMILIES].sort((a, b) => (state.vocab[b.key]?.missed?.length ?? 0) - (state.vocab[a.key]?.missed?.length ?? 0))[0]
  return { key: f.key, label: f.label, mode: 'mot' }
}

export function Today() {
  const { state } = useStore()
  const p = useProgress()
  const today = dayKey()
  const done = new Set(state.done[today] ?? [])
  const due = dueReviews(state)
  const ch = nextQuestionChapter(state)
  const vocab = weakestVocab(state)
  const lastSim = state.sims[state.sims.length - 1]
  const simDue = !lastSim || daysBetween(dayKey(new Date(lastSim.date)), today) >= 14
  const remaining = ALL_QUESTIONS.length - p.mastered
  const perDay = p.examIn && p.examIn > 0 ? Math.ceil(remaining / p.examIn) : null

  const greeting = new Date().getHours() < 12 ? 'Gudde Moien' : new Date().getHours() < 18 ? 'Moien' : 'Gudden Owend'

  return (
    <>
      <header className="stack">
        <h1>{greeting} !<small>Préparez l'oral du Sproochentest : on répond à voix haute, jamais par écrit.</small></h1>
        <Rings />
        <div className="note">Prototype. Les phrases en luxembourgeois sont un premier jet à faire relire par un natif. L'écoute des questions viendra avec des enregistrements de locuteurs natifs (la voix de synthèse déformait la prononciation).</div>
      </header>

      {state.profile.examDate ? (
        <section className="card tight">
          <div className="between">
            <div>
              <div className="label">Mon examen</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                {p.examIn! > 0 ? `Dans ${p.examIn} jour${p.examIn! > 1 ? 's' : ''}` : p.examIn === 0 ? "C'est aujourd'hui !" : 'Date passée'}
              </div>
              <div className="small muted">{formatDate(state.profile.examDate)}</div>
            </div>
            <Link className="ghost" to="/reglages">Modifier</Link>
          </div>
          {perDay !== null && remaining > 0 && (
            <p className="small">Plan à rebours : environ <b>{perDay} question{perDay > 1 ? 's' : ''} par jour</b> pour maîtriser les {remaining} questions restantes avant l'examen.</p>
          )}
        </section>
      ) : (
        <Link className="card tight" to="/reglages" style={{ textDecoration: 'none', color: 'var(--fg)' }}>
          <div className="between"><span><b>Ajoutez la date de votre examen</b><br /><span className="small muted">pour obtenir un plan d'entraînement à rebours.</span></span><Icon name="chevron" className="" /></div>
        </Link>
      )}

      <section className="stack">
        <h2>Plan du jour</h2>
        <ul className="plan">
          <li>
            <Link className={done.has('vocab') ? 'done' : ''} to={`/vocabulaire?famille=${vocab.key}&mode=${vocab.mode}`}>
              <span className="tick">{done.has('vocab') && <Icon name="check" />}</span>
              <span style={{ flex: 1 }}><b>Vocabulaire · {vocab.label}</b><small>{vocab.mode === 'mot' ? 'Dire le mot' : 'Faire une phrase'} · environ 3 min</small></span>
              <Icon name="chevron" className="" />
            </Link>
          </li>
          <li>
            {due.length > 0 ? (
              <Link className={done.has('oral') ? 'done' : ''} to="/revisions">
                <span className="tick">{done.has('oral') && <Icon name="check" />}</span>
                <span style={{ flex: 1 }}><b>Réviser {due.length} question{due.length > 1 ? 's' : ''} maîtrisée{due.length > 1 ? 's' : ''}</b><small>Répétition espacée · environ {Math.max(3, due.length * 2)} min</small></span>
                <Icon name="chevron" className="" />
              </Link>
            ) : (
              <Link className={done.has('oral') ? 'done' : ''} to={ch !== null ? `/?c=${ch}` : '/'}>
                <span className="tick">{done.has('oral') && <Icon name="check" />}</span>
                <span style={{ flex: 1 }}><b>Exercice oral · {ch !== null ? CHAPTERS[ch].title : 'Pas à pas'}</b><small>Répondre à voix haute à de nouvelles questions · environ 10 min</small></span>
                <Icon name="chevron" className="" />
              </Link>
            )}
          </li>
          <li>
            <Link className={done.has('image') ? 'done' : ''} to="/image">
              <span className="tick">{done.has('image') && <Icon name="check" />}</span>
              <span style={{ flex: 1 }}><b>Description d'image</b><small>Une image à décrire en 1 à 2 minutes</small></span>
              <Icon name="chevron" className="" />
            </Link>
          </li>
          <li>
            <div className="item" aria-disabled="true" style={{ opacity: 0.7 }}>
              <span className="tick"><Icon name="headphones" /></span>
              <span style={{ flex: 1 }}><b>Écoute (compréhension B1)</b><small>Bientôt : en attente des enregistrements de locuteurs natifs</small></span>
            </div>
          </li>
        </ul>
        {simDue && (
          <Link className="card tight" to="/simulation" style={{ textDecoration: 'none', color: 'var(--fg)', borderColor: 'var(--accent)' }}>
            <div className="between">
              <span><b>Simulation d'examen proposée</b><br /><span className="small muted">{lastSim ? 'Votre dernière simulation date de plus de 2 semaines.' : "Testez-vous dans les conditions de l'épreuve orale (environ 10 min)."}</span></span>
              <Icon name="chevron" className="" />
            </div>
          </Link>
        )}
      </section>
    </>
  )
}
