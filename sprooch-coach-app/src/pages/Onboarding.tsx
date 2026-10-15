// Premier lancement (PRD §6) : langue, niveau estimé, date d'examen.
import { useState } from 'react'
import { useStore } from '../lib/store'

const SELF_TEST = [
  ['Je peux me présenter : nom, âge, pays, ville.', 'Ech heeschen … Ech kommen aus …'],
  ['Je peux parler de ma famille et de mon travail au présent.', 'Ech hunn zwee Kanner. Ech schaffen als …'],
  ['Je peux raconter ce que j’ai fait le week-end dernier.', 'Ech sinn … gaangen. Ech hunn … gemaach.'],
  ['Je peux donner mon avis et le justifier.', 'Ech mengen, datt … well …'],
] as const

export function Onboarding() {
  const { update } = useStore()
  const [step, setStep] = useState(0)
  const [can, setCan] = useState<boolean[]>(SELF_TEST.map(() => false))
  const [date, setDate] = useState('')
  const n = can.filter(Boolean).length
  const level = n <= 1 ? 'debutant' : n <= 2 ? 'A1' : 'A2'
  const levelLabel = { debutant: 'débutant', A1: 'A1', A2: 'A2' }[level]

  const finish = () => update(s => ({
    ...s,
    profile: { onboarded: true, level, examDate: date || undefined },
  }))

  return (
    <main className="wrap" style={{ paddingBottom: 48 }}>
      <h1>Sprooch Coach<small>Préparez l'oral du Sproochentest : on répond à voix haute, jamais par écrit.</small></h1>
      <p className="small muted num">Étape {step + 1} / 3</p>

      {step === 0 && (
        <section className="card">
          <h2>Bienvenue</h2>
          <p>Chaque jour, 15 à 20 minutes : du vocabulaire, des questions d'examinateur auxquelles vous répondez à voix haute, et des images à décrire. L'app ne juge pas votre accent : elle vous donne la bonne réponse quand vous la demandez, et vous vous évaluez vous-même.</p>
          <div className="stack" style={{ gap: 6 }}>
            <span className="small muted">Langue de l'interface</span>
            <div className="seg" role="group" aria-label="Langue de l'interface">
              <button aria-pressed="true">Français</button>
              <button disabled title="Prévu dans une prochaine version">English (bientôt)</button>
            </div>
          </div>
          <p className="note">Prototype : les phrases en luxembourgeois sont un premier jet, à faire relire par un locuteur natif.</p>
          <button className="btn primary" onClick={() => setStep(1)}>Commencer</button>
        </section>
      )}

      {step === 1 && (
        <section className="card">
          <h2>Où en êtes-vous ?</h2>
          <p className="small muted">Cochez ce que vous pouvez déjà dire en luxembourgeois, sans regarder de texte.</p>
          <div className="checks">
            {SELF_TEST.map(([fr, lb], i) => (
              <label key={fr}>
                <input type="checkbox" checked={can[i]} onChange={() => setCan(can.map((c, j) => (j === i ? !c : c)))} />
                <span>{fr}<br /><span className="small muted" lang="lb">{lb}</span></span>
              </label>
            ))}
          </div>
          <p className="model">Niveau estimé : <b>{levelLabel}</b>. {level === 'A2' ? 'Concentrez-vous sur les questions A2, celles de l’examen.' : 'Commencez par le chapitre « Se présenter », puis montez vers l’A2.'}</p>
          <div className="row2">
            <button className="ghost" style={{ justifyContent: 'center' }} onClick={() => setStep(0)}>Retour</button>
            <button className="btn primary" onClick={() => setStep(2)}>Continuer</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <h2>Quand passez-vous l'examen ?</h2>
          <p className="small muted">Avec une date, l'app vous propose un rythme d'entraînement à rebours. Vous pourrez la changer dans les réglages.</p>
          <input className="field" type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Date de l'examen" />
          <div className="row2">
            <button className="ghost" style={{ justifyContent: 'center' }} onClick={() => setStep(1)}>Retour</button>
            <button className="btn primary" onClick={finish}>{date ? 'Voir mon plan du jour' : 'Je ne sais pas encore'}</button>
          </div>
        </section>
      )}
    </main>
  )
}
