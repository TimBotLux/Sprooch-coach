// Quiz de vocabulaire « oral d'abord » (PRD §4.0 bis).
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VOCAB, VOCAB_BY_KEY } from '../data'
import { WordQuiz, type QuizItem } from '../components/WordQuiz'
import { pickWithPriority, shuffle } from '../lib/random'
import { useStore } from '../lib/store'

/** Quiz courts : 5 à 10 items (PRD). */
const QUIZ_SIZE = 8

export function Vocabulaire() {
  const { state, setVocabResult, markDone } = useStore()
  const [params] = useSearchParams()
  const [theme, setTheme] = useState(() => (params.get('theme') && VOCAB_BY_KEY.has(params.get('theme')!) ? params.get('theme')! : VOCAB[0].key))
  const [mode, setMode] = useState<'mot' | 'phrase'>(() => (params.get('mode') === 'phrase' ? 'phrase' : 'mot'))
  const [items, setItems] = useState<QuizItem[] | null>(null)
  const [run, setRun] = useState(0)
  const v = VOCAB_BY_KEY.get(theme)!

  const start = () => {
    const missed = new Set(state.vocab[theme]?.missed ?? [])
    const next: QuizItem[] = mode === 'mot'
      ? pickWithPriority(v.items, it => missed.has(it[0]), QUIZ_SIZE).map(it => ({ prompt: it[1], answer: it[0], color: v.swatch ? it[2] : undefined }))
      : shuffle(v.phrases).map(p => ({ prompt: p[0], answer: p[1] }))
    setItems(next)
    setRun(r => r + 1)
  }

  if (items) {
    return (
      <>
        <h1>Vocabulaire<small>{v.label}</small></h1>
        <WordQuiz
          key={run}
          title={v.label}
          mode={mode}
          items={items}
          onFinish={(score, missed, said) => { setVocabResult(theme, mode, Math.round((score / items.length) * 100), missed, said); markDone('vocab') }}
          onAgain={start}
          onExit={() => setItems(null)}
        />
      </>
    )
  }

  return (
    <>
      <h1>Vocabulaire<small>Courts exercices à l'oral, utilisables dans le train. Pas de QCM : vous dites toujours la réponse.</small></h1>
      <section className="stack">
        <div className="label">1. Choisissez un thème</div>
        <div className="themes">
          {VOCAB.map(t => {
            const sc = state.vocab[t.key] ?? {}
            const done = (sc.mot ?? 0) >= 80 && (sc.phrase ?? 0) >= 80
            const toReview = sc.missed?.length ?? 0
            return (
              <button key={t.key} className="theme" aria-pressed={theme === t.key} onClick={() => setTheme(t.key)}>
                <b>{t.label}{done && ' ✓'}</b>
                <span className="badges">
                  <span className={'badge' + ((sc.mot ?? 0) >= 80 ? ' on' : '')}>Mot{sc.mot != null ? ` ${sc.mot} %` : ''}</span>
                  <span className={'badge' + ((sc.phrase ?? 0) >= 80 ? ' on' : '')}>Phrase{sc.phrase != null ? ` ${sc.phrase} %` : ''}</span>
                  {toReview > 0 && <span className="badge warn">{toReview} à revoir</span>}
                </span>
              </button>
            )
          })}
        </div>
        <div className="label">2. Choisissez l'exercice</div>
        <div className="seg" role="group" aria-label="Exercice">
          <button aria-pressed={mode === 'mot'} onClick={() => setMode('mot')}>Dire le mot</button>
          <button aria-pressed={mode === 'phrase'} onClick={() => setMode('phrase')}>Faire une phrase</button>
        </div>
        <p className="hint">
          {mode === 'mot'
            ? "L'app affiche le mot en français (ou la couleur). Dites-le à voix haute en luxembourgeois, puis vérifiez. Les mots ratés reviennent en priorité."
            : "L'app vous donne une consigne. Répondez à voix haute par une phrase complète, puis comparez avec un exemple."} Le niveau est validé à 80 %.
        </p>
        <button className="btn primary" onClick={start}>Commencer</button>
        <p className="small muted">Un thème est maîtrisé (✓) quand « Dire le mot » et « Faire une phrase » sont validés. Le 3ᵉ niveau, « Utiliser dans l'entretien », se travaille dans les questions du module Pas à pas.</p>
      </section>
    </>
  )
}
