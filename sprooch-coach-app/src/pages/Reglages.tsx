// Réglages : examen, accessibilité (taille du texte), thème, micro, données personnelles.
import { useState } from 'react'
import { useStore, type ThemeMode } from '../lib/store'

const SIZES: [number, string][] = [[0.9, 'Petit'], [1, 'Normal'], [1.15, 'Grand'], [1.3, 'Très grand']]
const THEMES: [ThemeMode, string][] = [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']]

export function Reglages() {
  const { state, update, reset } = useStore()
  const [confirm, setConfirm] = useState(false)
  const set = <K extends keyof typeof state.settings>(k: K, v: (typeof state.settings)[K]) =>
    update(s => ({ ...s, settings: { ...s.settings, [k]: v } }))

  return (
    <>
      <h1>Réglages</h1>

      <section className="card tight">
        <h2>Mon examen</h2>
        <label className="stack" style={{ gap: 6 }}>
          <span className="small muted">Date de l'examen (pour le plan à rebours)</span>
          <input className="field" type="date" value={state.profile.examDate ?? ''} onChange={e => update(s => ({ ...s, profile: { ...s.profile, examDate: e.target.value || undefined } }))} />
        </label>
        <div className="stack" style={{ gap: 6 }}>
          <span className="small muted">Mon niveau estimé</span>
          <div className="seg" role="group" aria-label="Niveau estimé">
            {([['debutant', 'Débutant'], ['A1', 'A1'], ['A2', 'A2']] as const).map(([k, l]) => (
              <button key={k} aria-pressed={state.profile.level === k} onClick={() => update(s => ({ ...s, profile: { ...s.profile, level: k } }))}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="card tight">
        <h2>Affichage</h2>
        <div className="stack" style={{ gap: 6 }}>
          <span className="small muted">Thème</span>
          <div className="seg" role="group" aria-label="Thème">
            {THEMES.map(([k, l]) => <button key={k} aria-pressed={state.settings.theme === k} onClick={() => set('theme', k)}>{l}</button>)}
          </div>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <span className="small muted">Taille du texte</span>
          <div className="seg" role="group" aria-label="Taille du texte">
            {SIZES.map(([k, l]) => <button key={k} aria-pressed={state.settings.fontScale === k} onClick={() => set('fontScale', k)}>{l}</button>)}
          </div>
        </div>
        <label className="toggle"><input type="checkbox" checked={state.settings.unlock} onChange={e => set('unlock', e.target.checked)} /> Mode avancé : débloquer tous les chapitres</label>
        <p className="small muted">Langue de l'interface : français. L'anglais et le portugais sont prévus dans une prochaine version.</p>
      </section>

      <section className="card tight">
        <h2>Micro et confidentialité</h2>
        <label className="toggle">
          <input type="checkbox" checked={state.settings.mic === 'on'} onChange={e => set('mic', e.target.checked ? 'on' : 'off')} />
          M'enregistrer pour me réécouter
        </label>
        <p className="small muted">Vos enregistrements restent sur votre appareil et sont effacés dès que vous quittez l'exercice. Rien n'est envoyé sur internet. Votre progression est enregistrée dans ce navigateur uniquement.</p>
        {!confirm ? (
          <button className="ghost danger" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(true)}>Effacer toute ma progression</button>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            <p className="small"><b>Effacer définitivement</b> les statuts des questions, les scores, les mots cochés et l'historique ? Cette action est irréversible.</p>
            <div className="row">
              <button className="ghost danger" onClick={() => { reset(); setConfirm(false) }}>Oui, tout effacer</button>
              <button className="ghost" onClick={() => setConfirm(false)}>Annuler</button>
            </div>
          </div>
        )}
      </section>

      <section className="card tight">
        <h2>À propos</h2>
        <p className="small muted">Sprooch Coach n'analyse jamais votre voix : il vous donne la bonne réponse quand vous la demandez, et c'est vous qui jugez. Les enregistrements servent seulement à vous réécouter. Les questions, les réponses modèles et le lexique sont un premier jet à faire relire par un locuteur natif. Les thèmes d'examen proviennent des cours de préparation : il n'existe pas de liste officielle de l'INL.</p>
      </section>
    </>
  )
}
