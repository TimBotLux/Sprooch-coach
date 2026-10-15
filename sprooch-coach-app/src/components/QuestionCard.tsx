// Une question du module « Pas à pas » (PRD §4.0, fonctionnement en 5 étapes).
import { useState } from 'react'
import { CRITERIA, type Question } from '../data'
import { qStatus, useStore, type QStatus } from '../lib/store'
import { Icon } from './Icon'
import { SpeakPanel } from './SpeakPanel'

const STATUSES: [QStatus, string][] = [['voir', 'À voir'], ['cours', 'En cours'], ['ok', 'Maîtrisée']]

export function QuestionCard({ q, review = false, onReviewed }: { q: Question; review?: boolean; onReviewed?: () => void }) {
  const { state, setQStatus, reviewQ, update, markDone } = useStore()
  const [tr, setTr] = useState(false)
  const [spoken, setSpoken] = useState(false)
  const [checks, setChecks] = useState([false, false, false])
  const [model, setModel] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const status = qStatus(state, q.id)
  const asked = !!state.examAsked[q.id]

  const toggleCheck = (i: number) => {
    const next = checks.map((c, j) => (j === i ? !c : c))
    setChecks(next)
    if (next.every(Boolean) && status === 'voir') setQStatus(q.id, 'cours')
  }

  const restart = () => { setSpoken(false); setChecks([false, false, false]); setModel(false); setAttempt(a => a + 1) }

  return (
    <div className="q">
      <div className="row">
        <span className={'lv' + (q.lv === 'A2' ? ' a2' : '')} title={q.lv === 'A2' ? "Niveau A2 : niveau attendu à l'examen" : 'Niveau A1 : base'}>{q.lv}</span>
        {asked && <span className="badge warn">Posée à mon examen</span>}
        {review && <span className="badge accent">À réviser</span>}
      </div>
      <div className="lb" lang="lb">{q.lb}</div>
      <div className="audio-slot"><Icon name="ear" /> Audio d'un locuteur natif : à enregistrer</div>
      {q.v && <div className="small muted">L'examinateur peut aussi dire : <b lang="lb" style={{ color: 'var(--fg)', fontWeight: 600 }}>{q.v}</b></div>}
      <div className="row">
        <button className="ghost" onClick={() => setTr(!tr)} aria-expanded={tr}>{tr ? 'Masquer' : 'Voir'} la traduction</button>
        <button className="ghost" onClick={() => setModel(!model)} aria-expanded={model}>{model ? 'Masquer' : 'Voir'} la réponse modèle</button>
      </div>
      {tr && <div className="fr">{q.fr}</div>}
      {model && (
        <div className="model">
          <div className="lbm" lang="lb">{q.m}</div>
          <div className="fr">{q.mf}</div>
        </div>
      )}

      <SpeakPanel
        key={attempt}
        target={[20, 40]}
        tip={<><b style={{ color: 'var(--fg)' }}>Répondez à voix haute maintenant.</b> 2 à 4 phrases. Pensez à : quand ? où ? pourquoi ? avec qui ?</>}
        onDone={() => { setSpoken(true); markDone('oral') }}
      />

      {spoken && (
        <div className="practice">
          <div className="label">Vérifiez votre réponse</div>
          <div className="checks">
            {CRITERIA.map((c, i) => (
              <label key={c}><input type="checkbox" checked={checks[i]} onChange={() => toggleCheck(i)} /> {c}</label>
            ))}
          </div>
          <div className="row">
            {!model && <button className="ghost" onClick={() => setModel(true)}>Comparer avec la réponse modèle</button>}
            <button className="ghost" onClick={restart}>Recommencer</button>
          </div>
          {review && (
            <div className="row2">
              <button className="ok-btn" onClick={() => { reviewQ(q.id, true); onReviewed?.() }}>Toujours maîtrisée</button>
              <button className="ko-btn" onClick={() => { reviewQ(q.id, false); onReviewed?.() }}>J'ai hésité</button>
            </div>
          )}
        </div>
      )}

      {!review && (
        <div className="seg status" role="group" aria-label="Statut de la question">
          {STATUSES.map(([k, l]) => (
            <button key={k} data-s={k} aria-pressed={status === k} onClick={() => setQStatus(q.id, k)}>{l}</button>
          ))}
        </div>
      )}
      <label className="toggle small">
        <input type="checkbox" checked={asked} onChange={() => update(s => {
          const examAsked = { ...s.examAsked }
          if (asked) delete examAsked[q.id]; else examAsked[q.id] = true
          return { ...s, examAsked }
        })} />
        On m'a posé cette question à l'examen
      </label>
    </div>
  )
}
