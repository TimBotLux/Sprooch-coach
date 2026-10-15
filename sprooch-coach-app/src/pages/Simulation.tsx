// Simulation de l'épreuve orale (PRD §4.1 et §4.5) : deux thèmes tirés au sort, entretien chronométré
// puis description d'image, sans aide, et rapport de fin indicatif.
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS, INTRO_CHAPTERS, type Chapter, type Question } from '../data'
import { SCENES, type Scene } from '../data/images'
import { SceneVisual } from '../components/SceneCard'
import { SpeakPanel } from '../components/SpeakPanel'
import { shuffle } from '../lib/random'
import { useStore } from '../lib/store'
import { dayKey, formatDuration } from '../lib/dates'

const N_QUESTIONS = 5
const ANSWER_LIMIT = 60
const IMAGE_LIMIT = 120

const SELF_CHECKS = [
  ['entretien', "J'ai répondu par des phrases complètes."],
  ['entretien', "J'ai ajouté des détails (quand, où, pourquoi, avec qui)."],
  ['entretien', "J'ai utilisé le passé ou donné mon avis avec « well » ou « datt »."],
  ['entretien', "J'ai parlé sans longue pause."],
  ['image', "J'ai décrit qui, où et quoi sur l'image."],
  ['image', "J'ai comparé l'image avec ma propre vie."],
] as const

type Step = 'intro' | 'theme' | 'interview' | 'pickImage' | 'image' | 'eval' | 'report'

function pickQuestions(c: Chapter): Question[] {
  const a2 = shuffle(c.qs.filter(q => q.lv === 'A2'))
  const a1 = shuffle(c.qs.filter(q => q.lv === 'A1'))
  return [...a1.slice(0, 1), ...a2].slice(0, N_QUESTIONS)
}

export function Simulation() {
  const { state, update } = useStore()
  const [step, setStep] = useState<Step>('intro')
  const themes = useMemo(() => shuffle(CHAPTERS.slice(INTRO_CHAPTERS)).slice(0, 2), [])
  const sceneChoices = useMemo(() => shuffle(SCENES).slice(0, 3), [])
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [qs, setQs] = useState<Question[]>([])
  const [qi, setQi] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [scene, setScene] = useState<Scene | null>(null)
  const [checks, setChecks] = useState<boolean[]>(SELF_CHECKS.map(() => false))
  const seconds = useRef(0)

  const lastSim = state.sims[state.sims.length - 1]

  if (step === 'intro') {
    return (
      <>
        <h1>Simulation d'examen<small>L'épreuve orale dans les conditions réelles : chronométrée et sans aide.</small></h1>
        <div className="card">
          <ol className="canvas-list">
            <li><b>Entretien</b> : choisissez un thème parmi deux tirés au sort, puis répondez à {N_QUESTIONS} questions (1 minute maximum chacune).</li>
            <li><b>Description d'image</b> : choisissez une image parmi trois et décrivez-la (2 minutes maximum).</li>
            <li><b>Bilan</b> : vous évaluez vos réponses et obtenez un rapport indicatif.</li>
          </ol>
          <p className="note">La compréhension orale (B1, environ 25 minutes) n'est pas encore incluse : elle demande des audios enregistrés par des locuteurs natifs.</p>
          <p className="small muted">Pas de traduction ni de réponse modèle pendant la simulation. Trouvez un endroit calme : comptez environ 10 minutes.</p>
          {lastSim && <p className="small muted">Dernière simulation : {new Date(lastSim.date).toLocaleDateString('fr-FR')} ({lastSim.score} / {lastSim.total} critères).</p>}
          <button className="btn primary" onClick={() => setStep('theme')}>Commencer la simulation</button>
        </div>
      </>
    )
  }

  if (step === 'theme') {
    return (
      <>
        <h1>Entretien<small>Choisissez votre thème, comme à l'examen.</small></h1>
        <div className="menu">
          {themes.map(c => (
            <button key={c.index} className="theme" style={{ padding: 16 }} onClick={() => { setChapter(c); setQs(pickQuestions(c)); setQi(0); setAnswered(false); setStep('interview') }}>
              <b lang="lb" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem' }}>{c.title}</b>
              <span className="small muted">{c.sub}</span>
            </button>
          ))}
        </div>
      </>
    )
  }

  if (step === 'interview' && chapter) {
    const q = qs[qi]
    const next = () => {
      if (qi + 1 < qs.length) { setQi(qi + 1); setAnswered(false) } else setStep('pickImage')
    }
    return (
      <>
        <h1>Entretien · {chapter.title}<small className="num">Question {qi + 1} / {qs.length}</small></h1>
        <div className="card" key={q.id}>
          <div className="label">L'examinateur demande</div>
          <div className="big prompt" lang="lb" style={{ textAlign: 'left' }}>{q.lb}</div>
          <SpeakPanel target={[20, 40]} limit={ANSWER_LIMIT} label="Répondre" onDone={s => { seconds.current += s; setAnswered(true) }} />
          {answered && <button className="btn primary" onClick={next}>{qi + 1 < qs.length ? 'Question suivante' : "Passer à l'image"}</button>}
        </div>
      </>
    )
  }

  if (step === 'pickImage') {
    return (
      <>
        <h1>Description d'image<small>Choisissez une image parmi trois.</small></h1>
        <div className="scenes">
          {sceneChoices.map(s => (
            <button key={s.id} className="scene" onClick={() => { setScene(s); setAnswered(false); setStep('image') }}>
              <SceneVisual scene={s} />
              <b>{s.title}</b>
            </button>
          ))}
        </div>
      </>
    )
  }

  if (step === 'image' && scene) {
    return (
      <>
        <h1>Description d'image<small>{scene.title} · 2 minutes maximum</small></h1>
        <div className="card">
          <div style={{ borderRadius: 10, overflow: 'hidden' }}><SceneVisual scene={scene} large /></div>
          <SpeakPanel target={[60, 120]} limit={IMAGE_LIMIT} label="Décrire l'image" onDone={s => { seconds.current += s; setAnswered(true) }} />
          {answered && <button className="btn primary" onClick={() => setStep('eval')}>Terminer et faire le bilan</button>}
        </div>
      </>
    )
  }

  const score = checks.filter(Boolean).length
  const total = SELF_CHECKS.length

  if (step === 'eval') {
    return (
      <>
        <h1>Bilan<small>Soyez honnête : cochez seulement ce que vous avez vraiment fait.</small></h1>
        <div className="card">
          {(['entretien', 'image'] as const).map(part => (
            <div className="stack" key={part} style={{ gap: 8 }}>
              <div className="label">{part === 'entretien' ? 'Entretien' : 'Description d’image'}</div>
              <div className="checks">
                {SELF_CHECKS.map(([p, label], i) => p === part && (
                  <label key={label}><input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((c, j) => (j === i ? !c : c)))} /> {label}</label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn primary" onClick={() => {
            update(s => ({ ...s, sims: [...s.sims, { date: new Date().toISOString(), chapter: chapter?.index ?? -1, scene: scene?.id ?? '', score, total, seconds: Math.round(seconds.current) }], done: { ...s.done, [dayKey()]: [...new Set([...(s.done[dayKey()] ?? []), 'oral' as const, 'image' as const])] } }))
            setStep('report')
          }}>Voir mon rapport</button>
        </div>
      </>
    )
  }

  const strengths = SELF_CHECKS.filter((_, i) => checks[i]).map(c => c[1])
  const toWork = SELF_CHECKS.filter((_, i) => !checks[i]).map(c => c[1])
  const estimate = score >= 5 ? 'Proche du niveau A2 attendu à l’examen' : score >= 3 ? 'En progression vers le niveau A2' : 'Niveau A1 : continuez le module Pas à pas'

  return (
    <>
      <h1>Rapport de simulation<small>{chapter?.title} · {scene?.title} · {formatDuration(seconds.current)} de parole</small></h1>
      <div className="card">
        <div className="big num">{score} / {total}</div>
        <p className="hint"><b style={{ color: 'var(--fg)' }}>Estimation indicative :</b> {estimate}.</p>
        {strengths.length > 0 && (
          <div className="stack" style={{ gap: 4 }}>
            <div className="label">Points forts</div>
            <ul className="canvas-list">{strengths.map(s => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
        {toWork.length > 0 && (
          <div className="stack" style={{ gap: 4 }}>
            <div className="label">Points à travailler</div>
            <ul className="canvas-list">{toWork.map(s => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
        <p className="note">Ce n'est pas une note officielle : seule l'épreuve de l'INL fait foi.</p>
        <div className="row2">
          {chapter && <Link className="btn primary" to={`/pas-a-pas?c=${chapter.index}`}>Travailler ce thème</Link>}
          <Link className="ghost" style={{ justifyContent: 'center' }} to="/">Retour à l'accueil</Link>
        </div>
      </div>
    </>
  )
}
