// Module central « Pas à pas » (PRD §4.0) : chapitres, questions, déverrouillage à 80 %.
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ALL_QUESTIONS, CHAPTERS, INTRO_CHAPTERS, RELANCES } from '../data'
import { QuestionCard } from '../components/QuestionCard'
import { isUnlocked, qStatus, useStore } from '../lib/store'

export function PasAPas() {
  const { state, update } = useStore()
  const [params] = useSearchParams()
  const target = params.get('c')
  const [open, setOpen] = useState<Record<number, boolean>>(() => (target ? { [Number(target)]: true } : { 0: true }))
  const lvl = state.settings.level
  const mastered = ALL_QUESTIONS.filter(q => qStatus(state, q.id) === 'ok').length

  useEffect(() => {
    if (target) document.getElementById(`ch-${target}`)?.scrollIntoView({ block: 'start' })
  }, [target])

  const setSetting = <K extends keyof typeof state.settings>(k: K, v: (typeof state.settings)[K]) =>
    update(s => ({ ...s, settings: { ...s.settings, [k]: v } }))

  return (
    <>
      <header className="stack">
        <h1>Pas à pas<small>Les questions que les examinateurs posent le plus souvent, du plus simple au plus riche.</small></h1>
        <div className="stack" style={{ gap: 6 }}>
          <div className="between small muted"><span>Questions maîtrisées</span><span className="num">{mastered} / {ALL_QUESTIONS.length}</span></div>
          <div className="bar"><i style={{ width: `${(mastered / ALL_QUESTIONS.length) * 100}%` }} /></div>
        </div>
      </header>

      <section className="stack">
        <div className="seg" role="group" aria-label="Niveau des questions">
          {([['all', 'Tous les niveaux'], ['A1', 'A1 · base'], ['A2', 'A2 · examen']] as const).map(([k, l]) => (
            <button key={k} aria-pressed={lvl === k} onClick={() => setSetting('level', k)}>{l}</button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={state.settings.unlock} onChange={e => setSetting('unlock', e.target.checked)} />
          Mode avancé : débloquer tous les chapitres
        </label>

        {CHAPTERS.map(c => {
          const ci = c.index
          const un = isUnlocked(state, ci)
          const isOpen = !!open[ci]
          const ok = c.qs.filter(q => qStatus(state, q.id) === 'ok').length
          const a1 = c.qs.filter(q => q.lv === 'A1').length
          const shown = c.qs.filter(q => lvl === 'all' || q.lv === lvl)
          return (
            <article className="chapter" key={ci} id={`ch-${ci}`}>
              <button className="chapter-head" aria-expanded={isOpen} onClick={() => setOpen(o => ({ ...o, [ci]: !isOpen }))}>
                <span className="n">{ci + 1}</span>
                <span className="t">{c.title}<small>{c.sub} · {a1} A1, {c.qs.length - a1} A2{un ? '' : ' · verrouillé'}</small></span>
                <span className="count num">{ok} / {c.qs.length}</span>
              </button>
              <div className="minibar" style={{ margin: '0 16px 12px' }}><i style={{ width: `${(ok / c.qs.length) * 100}%` }} /></div>
              {isOpen && !un && (
                <div className="lock">
                  {ci < INTRO_CHAPTERS
                    ? 'Chapitre verrouillé. Passez au moins 80 % des questions du chapitre précédent en « En cours ».'
                    : "Les thèmes d'examen se débloquent quand les 3 chapitres d'introduction sont à 80 % « En cours ». Ou activez le mode avancé."}
                </div>
              )}
              {isOpen && un && (
                <>
                  <div className="qs">
                    {shown.length ? shown.map(q => <QuestionCard key={q.id} q={q} />) : <div className="lock" style={{ paddingTop: 14 }}>Aucune question de ce niveau dans ce chapitre.</div>}
                  </div>
                  <div className="relances">
                    <span className="label">Relances possibles de l'examinateur</span>
                    <div className="chips-lb" lang="lb">{RELANCES.map(([lb, fr]) => <span key={lb} title={fr}>{lb}</span>)}</div>
                    <span>Entraînez-vous à développer : après votre réponse, imaginez l'une de ces relances et répondez encore.</span>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </section>
    </>
  )
}
