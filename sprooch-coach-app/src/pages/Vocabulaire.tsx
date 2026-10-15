// Onglet Vocabulaire, au format de la charte (écran 04) : 1. thème, 2. exercice, Commencer.
// Les thèmes sont les 26 familles du lexique (Relecture-lexique-Sprooch-Coach.xlsx).
// Pas de QCM et aucune analyse de la voix : l'app montre la réponse, l'utilisateur s'auto-évalue.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FAMILIES, FAMILY_BY_KEY } from '../data'
import { WordQuiz, type QuizItem } from '../components/WordQuiz'
import { pickWithPriority, shuffle } from '../lib/random'
import { useStore } from '../lib/store'

/** Quiz courts : 5 à 10 items (PRD). */
const QUIZ_SIZE = 8

export function Vocabulaire() {
  const { state, setVocabResult, setLex, markDone } = useStore()
  const [params] = useSearchParams()
  const [famKey, setFamKey] = useState(() => (FAMILY_BY_KEY.has(params.get('famille') ?? '') ? params.get('famille')! : FAMILIES[0].key))
  const [mode, setMode] = useState<'mot' | 'phrase'>(() => (params.get('mode') === 'phrase' ? 'phrase' : 'mot'))
  const [keyOnly, setKeyOnly] = useState(true)
  const [items, setItems] = useState<QuizItem[] | null>(null)
  const [run, setRun] = useState(0)
  const fam = FAMILY_BY_KEY.get(famKey)!
  const canPhrase = fam.phrases.length > 0
  const curMode = canPhrase ? mode : 'mot'
  const pool = keyOnly && fam.keyCount >= 5 ? fam.words.filter(w => w[3]) : fam.words

  const start = () => {
    const missed = new Set(state.vocab[fam.key]?.missed ?? [])
    const next: QuizItem[] = curMode === 'mot'
      ? pickWithPriority(pool, w => missed.has(w[1]), QUIZ_SIZE).map(w => ({ prompt: w[2], answer: w[1], color: fam.swatch.get(w[1]) }))
      : shuffle(fam.phrases).slice(0, QUIZ_SIZE).map(p => ({ prompt: p[0], answer: p[1] }))
    setItems(next)
    setRun(r => r + 1)
  }

  if (items) {
    return (
      <WordQuiz
        key={run}
        title={fam.label}
        mode={curMode}
        items={items}
        onFinish={(score, missed, said) => {
          setVocabResult(fam.key, curMode, Math.round((score / items.length) * 100), missed, said)
          if (curMode === 'mot') setLex(said, true)
          markDone('vocab')
        }}
        onAgain={start}
        onExit={() => setItems(null)}
        resultHint={pct => (pct >= 80 ? 'Niveau validé pour ce thème. Bravo !' : 'Encore un effort : il faut 80 % pour valider. Les mots ratés reviendront en priorité.')}
      />
    )
  }

  return (
    <section className="stack">
      <div className="label">1. Choisissez un thème</div>
      <div className="themes">
        {FAMILIES.map(f => {
          const sc = state.vocab[f.key] ?? {}
          const toReview = sc.missed?.length ?? 0
          return (
            <button key={f.key} className="theme" aria-pressed={famKey === f.key} onClick={() => setFamKey(f.key)}>
              <b>{f.label}</b>
              <span className="badges">
                <span className={'badge' + ((sc.mot ?? 0) >= 80 ? ' on' : '')}>Mot{sc.mot != null ? ` ${sc.mot} %` : ''}</span>
                {f.phrases.length > 0 && <span className={'badge' + ((sc.phrase ?? 0) >= 80 ? ' on' : '')}>Phrase{sc.phrase != null ? ` ${sc.phrase} %` : ''}</span>}
                {toReview > 0 && <span className="badge warn">{toReview} à revoir</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="label">2. Choisissez l'exercice</div>
      <div className="seg" role="group" aria-label="Exercice">
        <button aria-pressed={curMode === 'mot'} onClick={() => setMode('mot')}>Dire le mot</button>
        <button aria-pressed={curMode === 'phrase'} onClick={() => setMode('phrase')} disabled={!canPhrase} title={canPhrase ? undefined : 'Pas encore de consignes pour ce thème'}>Faire une phrase</button>
      </div>
      {curMode === 'mot' && fam.keyCount >= 5 && (
        <label className="toggle">
          <input type="checkbox" checked={keyOnly} onChange={e => setKeyOnly(e.target.checked)} />
          Seulement les mots clés ({fam.keyCount} sur {fam.words.length})
        </label>
      )}
      <p className="hint">
        {curMode === 'mot'
          ? "L'app affiche le mot en français (ou la couleur). Dites-le à voix haute en luxembourgeois, puis vérifiez."
          : "L'app vous donne une consigne. Répondez à voix haute par une phrase complète, puis comparez avec un exemple."} Le niveau est validé à 80 %.
      </p>
      <button className="btn primary" onClick={start} disabled={curMode === 'mot' && !pool.length}>Commencer</button>
      <Link className="ghost" style={{ alignSelf: 'center' }} to={`/lexique?theme=${fam.index}`}>Voir les {fam.words.length} mots de « {fam.label} » (mots clés en gras)</Link>
    </section>
  )
}
