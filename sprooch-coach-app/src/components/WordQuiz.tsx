// Exercice oral « Dire le mot » / « Faire une phrase » (PRD §4.0 bis) : pas de QCM, auto-évaluation.
import { useState } from 'react'
import { useStore } from '../lib/store'
import { useRecorder } from '../lib/useRecorder'
import { Icon } from './Icon'

export interface QuizItem {
  /** Ce que l'app affiche (mot en français ou consigne) */
  prompt: string
  /** Réponse attendue en luxembourgeois (identifiant de l'item) */
  answer: string
  color?: string
}

interface Props {
  title: string
  mode: 'mot' | 'phrase'
  items: QuizItem[]
  onFinish: (score: number, missed: string[], said: string[]) => void
  onExit: () => void
  /** Nouvelle série (le parent retire de nouveaux items et remonte le composant) */
  onAgain?: () => void
  againLabel?: string
  exitLabel?: string
  resultHint?: (pct: number) => string
}

export function WordQuiz({ title, mode, items, onFinish, onExit, onAgain, againLabel = 'Recommencer', exitLabel = 'Autres thèmes', resultHint }: Props) {
  const { state, logActivity } = useStore()
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [said, setSaid] = useState<string[]>([])
  const [missed, setMissed] = useState<QuizItem[]>([])
  const [run, setRun] = useState(0)
  const rec = useRecorder(sec => logActivity(sec, 0))
  const micOn = state.settings.mic === 'on' && rec.supported

  if (i >= items.length) {
    const score = said.length
    const pct = Math.round((score / items.length) * 100)
    return (
      <div className="card">
        <div className="big num">{score} / {items.length}</div>
        <p className="hint">{resultHint ? resultHint(pct) : pct >= 80 ? 'Niveau validé pour ce thème. Bravo !' : 'Encore un effort : il faut 80 % pour valider.'}</p>
        {missed.length > 0 && (
          <div className="stack" style={{ gap: 4 }}>
            <div className="label">À redire à voix haute</div>
            {missed.map(m => (
              <div key={m.answer}>{mode === 'mot' ? <><b lang="lb">{m.answer}</b> : {m.prompt}</> : <b lang="lb">{m.answer}</b>}</div>
            ))}
          </div>
        )}
        <div className="row2">
          <button className="btn primary" onClick={() => {
            if (onAgain) { onAgain(); return }
            setI(0); setSaid([]); setMissed([]); setRevealed(false); setRun(r => r + 1)
          }}>{againLabel}</button>
          <button className="ghost" style={{ justifyContent: 'center' }} onClick={onExit}>{exitLabel}</button>
        </div>
      </div>
    )
  }

  const it = items[i]
  const answer = (ok: boolean) => {
    const nextSaid = ok ? [...said, it.answer] : said
    const nextMissed = ok ? missed : [...missed, it]
    rec.clear()
    setSaid(nextSaid)
    setMissed(nextMissed)
    setRevealed(false)
    logActivity(0, 1)
    if (i + 1 >= items.length) onFinish(nextSaid.length, nextMissed.map(m => m.answer), nextSaid)
    setI(i + 1)
  }

  return (
    <div className="card" key={run}>
      <div className="meta"><span>{title} · {mode === 'mot' ? 'Dire le mot' : 'Faire une phrase'}</span><span className="num">{i + 1} / {items.length}</span></div>
      {it.color && <div className="swatch" style={{ background: it.color }} role="img" aria-label={it.prompt} />}
      <div className={'big' + (mode === 'phrase' ? ' prompt' : '')}>{it.prompt}</div>
      {!revealed ? (
        <>
          <p className="hint">{mode === 'mot' ? 'Dites le mot à voix haute en luxembourgeois.' : 'Répondez à voix haute, en une ou deux phrases.'}</p>
          {micOn && (
            rec.state === 'recording'
              ? <button className="btn speak rec" onClick={rec.stop}><Icon name="stop" /> Arrêter l'enregistrement</button>
              : <button className="ghost" style={{ alignSelf: 'center' }} onClick={() => void rec.start()}><Icon name="mic" /> {rec.url ? 'Me réenregistrer' : "M'enregistrer"}</button>
          )}
          {rec.url && <audio controls src={rec.url} />}
          <button className="btn speak" onClick={() => { rec.stop(); setRevealed(true) }}>Voir la réponse</button>
        </>
      ) : (
        <>
          <div className="reveal" lang="lb">{it.answer}</div>
          <div className="audio-slot" style={{ justifyContent: 'center' }}><Icon name="ear" /> Audio d'un locuteur natif : à enregistrer</div>
          {rec.url && <div className="stack" style={{ gap: 4 }}><span className="label">Ma réponse</span><audio controls src={rec.url} /></div>}
          {mode === 'phrase' && <p className="hint">Exemple de réponse. La vôtre peut être différente : ce qui compte, c'est une phrase complète et compréhensible.</p>}
          <div className="row2">
            <button className="ok-btn" onClick={() => answer(true)}>Je l'ai bien dit</button>
            <button className="ko-btn" onClick={() => answer(false)}>À retravailler</button>
          </div>
        </>
      )}
    </div>
  )
}
