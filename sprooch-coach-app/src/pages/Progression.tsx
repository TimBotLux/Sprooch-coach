// Suivi de progression (PRD §4.6) : jours d'affilée, minutes parlées, thèmes couverts.
import { Link } from 'react-router-dom'
import { ALL_QUESTIONS, CHAPTERS, FAMILIES, LEX, QUESTION_BY_ID } from '../data'
import { SCENES } from '../data/images'
import { addDays, dayKey, formatDuration } from '../lib/dates'
import { qStatus, useProgress, useStore } from '../lib/store'

export function Progression() {
  const { state } = useStore()
  const p = useProgress()
  const today = dayKey()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const maxSec = Math.max(60, ...days.map(d => state.activity[d]?.sec ?? 0))
  const untouched = CHAPTERS.filter(c => c.qs.every(q => qStatus(state, q.id) === 'voir'))
  const asked = Object.keys(state.examAsked).map(id => QUESTION_BY_ID.get(id)).filter(Boolean)

  return (
    <>
      <h1>Ma progression<small>Votre entraînement est enregistré sur cet appareil uniquement.</small></h1>

      <div className="stats">
        <div className="stat"><b className="num">{p.streak}</b><span>jour{p.streak > 1 ? 's' : ''} d'affilée</span></div>
        <div className="stat"><b className="num">{formatDuration(p.secTotal)}</b><span>de parole enregistrée</span></div>
        <div className="stat"><b className="num">{p.mastered}</b><span>questions maîtrisées sur {ALL_QUESTIONS.length}</span></div>
        <div className="stat"><b className="num">{p.lexKnown}</b><span>mots que je sais dire sur {LEX.words.length}</span></div>
      </div>

      <section className="card tight">
        <h2>14 derniers jours</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: 4, alignItems: 'end', height: 96 }} role="img"
          aria-label={`Temps de parole par jour sur 14 jours, total ${formatDuration(days.reduce((a, d) => a + (state.activity[d]?.sec ?? 0), 0))}`}>
          {days.map(d => {
            const a = state.activity[d]
            const h = a ? Math.max(4, (a.sec / maxSec) * 96) : 2
            return <div key={d} title={`${d} : ${formatDuration(a?.sec ?? 0)}, ${a?.items ?? 0} exercice(s)`} style={{ height: h, borderRadius: 4, background: a ? 'var(--accent)' : 'var(--line)' }} />
          })}
        </div>
        <div className="between small muted"><span>il y a 2 semaines</span><span>aujourd'hui</span></div>
      </section>

      <section className="card tight">
        <h2>Questions par chapitre</h2>
        <table className="table">
          <thead><tr><th>Chapitre</th><th>En cours</th><th>Maîtrisées</th></tr></thead>
          <tbody>
            {CHAPTERS.map(c => {
              const ok = c.qs.filter(q => qStatus(state, q.id) === 'ok').length
              const cours = c.qs.filter(q => qStatus(state, q.id) === 'cours').length
              return (
                <tr key={c.index}>
                  <td><Link to={`/?c=${c.index}`}>{c.index + 1}. {c.title}</Link></td>
                  <td className="num">{cours}</td>
                  <td className="num">{ok} / {c.qs.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="card tight">
        <h2>Thèmes pas encore travaillés</h2>
        {untouched.length ? (
          <div className="chips-lb">{untouched.map(c => <span key={c.index}>{c.title}</span>)}</div>
        ) : <p className="small muted">Vous avez commencé tous les chapitres. Bravo !</p>}
      </section>

      <section className="card tight">
        <h2>Familles de vocabulaire</h2>
        <table className="table">
          <thead><tr><th>Famille</th><th>Dire le mot</th><th>Faire une phrase</th></tr></thead>
          <tbody>
            {FAMILIES.map(f => {
              const sc = state.vocab[f.key] ?? {}
              const cell = (n?: number) => (n == null ? '—' : `${n} %${n >= 80 ? ' ✓' : ''}`)
              return (
                <tr key={f.key}>
                  <td><Link to={`/vocabulaire?famille=${f.key}`}>{f.label}</Link></td>
                  <td className="num">{cell(sc.mot)}</td>
                  <td className="num">{f.phrases.length ? cell(sc.phrase) : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="card tight">
        <h2>Simulations d'examen</h2>
        {state.sims.length ? (
          <table className="table">
            <thead><tr><th>Date</th><th>Thème · image</th><th>Critères</th></tr></thead>
            <tbody>
              {[...state.sims].reverse().map(s => (
                <tr key={s.date}>
                  <td>{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                  <td>{CHAPTERS[s.chapter]?.title ?? '—'} · {SCENES.find(x => x.id === s.scene)?.title ?? '—'}</td>
                  <td className="num">{s.score} / {s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="small muted">Aucune simulation pour l'instant. <Link to="/simulation">En faire une</Link></p>}
      </section>

      <section className="card tight">
        <h2>Questions posées à mon examen</h2>
        {asked.length ? (
          <ul className="canvas-list">{asked.map(q => <li key={q!.id} lang="lb">{q!.lb}</li>)}</ul>
        ) : <p className="small muted">Après votre examen, cochez « On m'a posé cette question à l'examen » sous les questions concernées. Cela aidera à repérer les questions les plus fréquentes.</p>}
      </section>
    </>
  )
}
