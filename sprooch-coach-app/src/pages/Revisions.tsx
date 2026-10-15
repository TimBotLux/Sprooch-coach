// Révisions des questions maîtrisées (répétition espacée, PRD §4.0 étape 5).
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTER_OF, CHAPTERS, QUESTION_BY_ID } from '../data'
import { QuestionCard } from '../components/QuestionCard'
import { dueReviews, useStore } from '../lib/store'

export function Revisions() {
  const { state } = useStore()
  // Liste figée à l'ouverture : une question révisée reste visible jusqu'au prochain passage.
  const [ids] = useState(() => dueReviews(state))
  const [doneIds, setDoneIds] = useState<string[]>([])
  const left = ids.filter(id => !doneIds.includes(id))

  return (
    <>
      <h1>Révisions<small>Les questions maîtrisées reviennent de temps en temps. Si vous hésitez, elles repassent « En cours ».</small></h1>
      {left.length === 0 ? (
        <div className="card">
          <p className="hint">{ids.length ? 'Révisions du jour terminées. Bravo !' : "Aucune question à réviser aujourd'hui."}</p>
          <Link className="btn primary" to="/">Continuer le parcours Pas à pas</Link>
        </div>
      ) : (
        <div className="chapter">
          <div className="qs" style={{ borderTop: 0 }}>
            {left.map(id => {
              const q = QUESTION_BY_ID.get(id)!
              return (
                <div key={id}>
                  <div className="small muted" style={{ padding: '12px 16px 0' }}>{CHAPTERS[CHAPTER_OF.get(id)!].title}</div>
                  <QuestionCard q={q} review onReviewed={() => setDoneIds(d => [...d, id])} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
