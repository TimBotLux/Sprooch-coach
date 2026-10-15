// Module « Description d'image » (PRD §4.2) : choix parmi trois, canevas d'aide, enregistrement chronométré.
import { useState } from 'react'
import { IMAGE_CANVAS, IMAGE_STARTERS, SCENES, type Scene } from '../data/images'
import { SceneVisual } from '../components/SceneCard'
import { SpeakPanel } from '../components/SpeakPanel'
import { shuffle } from '../lib/random'
import { useStore } from '../lib/store'

const IMAGE_CHECKS = [
  "J'ai dit qui on voit, où et ce qu'ils font.",
  "J'ai décrit l'ambiance ou donné mon avis (« Ech mengen, datt … »).",
  "J'ai comparé avec ma propre vie.",
]

export function ImagePage() {
  const { markDone } = useStore()
  const [choices, setChoices] = useState<Scene[]>(() => shuffle(SCENES).slice(0, 3))
  const [scene, setScene] = useState<Scene | null>(null)
  const [canvas, setCanvas] = useState(true)
  const [words, setWords] = useState(false)
  const [spoken, setSpoken] = useState(false)
  const [checks, setChecks] = useState([false, false, false])
  const [attempt, setAttempt] = useState(0)

  if (!scene) {
    return (
      <>
        <h1>Description d'image<small>Comme à l'examen : choisissez une image parmi trois, puis décrivez-la à voix haute pendant 1 à 2 minutes.</small></h1>
        <div className="scenes">
          {choices.map(s => (
            <button key={s.id} className="scene" onClick={() => setScene(s)}>
              <SceneVisual scene={s} />
              <b>{s.title}</b>
            </button>
          ))}
        </div>
        <button className="ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setChoices(shuffle(SCENES).slice(0, 3))}>Tirer trois autres images</button>
      </>
    )
  }

  return (
    <>
      <h1>Description d'image<small>{scene.title}</small></h1>
      <div className="card">
        <div style={{ borderRadius: 10, overflow: 'hidden' }}><SceneVisual scene={scene} large /></div>
        <label className="toggle"><input type="checkbox" checked={canvas} onChange={e => setCanvas(e.target.checked)} /> Afficher le canevas d'aide</label>
        {canvas && (
          <div className="model stack" style={{ gap: 6 }}>
            <ul className="canvas-list">
              {IMAGE_CANVAS.map(([lb, fr]) => <li key={lb}><b lang="lb">{lb}</b> {fr}</li>)}
            </ul>
            <div className="small muted">Pour commencer : {IMAGE_STARTERS.map((s, i) => <span key={s} lang="lb"><i>{s}</i>{i < IMAGE_STARTERS.length - 1 ? ' · ' : ''}</span>)}</div>
          </div>
        )}
        <label className="toggle"><input type="checkbox" checked={words} onChange={e => setWords(e.target.checked)} /> Afficher des mots utiles</label>
        {words && (
          <div className="chips-lb" lang="lb">{scene.words.map(([lb, fr]) => <span key={lb} title={fr}>{lb}</span>)}</div>
        )}
        <SpeakPanel key={attempt} target={[60, 120]} label="Décrire l'image à voix haute" onDone={() => { setSpoken(true); markDone('image') }} />
        {spoken && (
          <div className="practice">
            <div className="label">Vérifiez votre description</div>
            <div className="checks">
              {IMAGE_CHECKS.map((c, i) => (
                <label key={c}><input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((x, j) => (j === i ? !x : x)))} /> {c}</label>
              ))}
            </div>
            <div className="row">
              <button className="ghost" onClick={() => { setSpoken(false); setChecks([false, false, false]); setAttempt(a => a + 1) }}>Recommencer</button>
              <button className="ghost" onClick={() => { setScene(null); setSpoken(false); setChecks([false, false, false]); setChoices(shuffle(SCENES).slice(0, 3)) }}>Autre image</button>
            </div>
          </div>
        )}
      </div>
      {!spoken && <button className="ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setScene(null)}>Choisir une autre image</button>}
    </>
  )
}
