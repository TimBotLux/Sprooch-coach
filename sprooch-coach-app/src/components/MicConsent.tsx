import { useEffect, useRef } from 'react'

/** Consentement explicite avant le premier enregistrement (PRD §8). */
export function MicConsent({ onAnswer }: { onAnswer: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => d?.close()
  }, [])
  return (
    <dialog ref={ref} aria-labelledby="mic-title" onCancel={e => { e.preventDefault(); onAnswer(false) }}>
      <div className="stack">
        <h2 id="mic-title">S'enregistrer pour se réécouter ?</h2>
        <p>Sprooch Coach peut enregistrer vos réponses pour que vous les réécoutiez.</p>
        <ul className="canvas-list small">
          <li>L'enregistrement reste <b>sur votre appareil</b>, rien n'est envoyé.</li>
          <li>Il est <b>effacé automatiquement</b> quand vous quittez l'exercice.</li>
          <li>Vous pouvez changer d'avis à tout moment dans les réglages.</li>
        </ul>
        <div className="row2">
          <button className="btn primary" onClick={() => onAnswer(true)}>Activer le micro</button>
          <button className="ghost" style={{ justifyContent: 'center' }} onClick={() => onAnswer(false)}>Sans enregistrement</button>
        </div>
      </div>
    </dialog>
  )
}
