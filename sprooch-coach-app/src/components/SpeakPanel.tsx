// Réponse à voix haute : chronomètre indicatif + enregistrement au micro pour se réécouter.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../lib/store'
import { useRecorder } from '../lib/useRecorder'
import { Icon } from './Icon'
import { MicConsent } from './MicConsent'

interface Props {
  /** Durée visée, en secondes */
  target: [number, number]
  label?: string
  tip?: ReactNode
  /** Appelé quand l'utilisateur a fini de parler */
  onDone?: (seconds: number) => void
  /** Démarrage automatique (simulation d'examen) */
  autoStart?: boolean
  /** Arrêt automatique après cette durée (simulation) */
  limit?: number
}

export function SpeakPanel({ target, label = 'Répondre à voix haute', tip, onDone, autoStart, limit }: Props) {
  const { state, update, logActivity } = useStore()
  const mic = state.settings.mic
  const rec = useRecorder()
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'done'>('idle')
  const [sec, setSec] = useState(0)
  const [asking, setAsking] = useState(false)
  const t0 = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const begin = (useMic: boolean) => {
    if (useMic && rec.supported) void rec.start()
    t0.current = Date.now()
    setSec(0)
    setPhase('speaking')
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => setSec((Date.now() - t0.current) / 1000), 250)
  }

  const start = () => {
    if (mic === 'ask' && rec.supported) { setAsking(true); return }
    begin(mic === 'on')
  }

  const finish = () => {
    window.clearInterval(timer.current)
    const s = (Date.now() - t0.current) / 1000
    rec.stop()
    setSec(s)
    setPhase('done')
    logActivity(s, 1)
    doneRef.current?.(s)
  }

  useEffect(() => {
    if (autoStart && phase === 'idle') start()
    // démarrage unique à l'affichage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (limit && phase === 'speaking' && sec >= limit) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, limit, phase])

  useEffect(() => () => window.clearInterval(timer.current), [])

  const [lo, hi] = target
  const shown = Math.floor(sec)

  return (
    <div className="stack">
      {asking && (
        <MicConsent
          onAnswer={ok => {
            update(s => ({ ...s, settings: { ...s.settings, mic: ok ? 'on' : 'off' } }))
            setAsking(false)
            begin(ok)
          }}
        />
      )}

      {phase === 'idle' && (
        <button className="btn speak" onClick={start}>
          <Icon name="mic" /> {label}
        </button>
      )}

      {phase === 'speaking' && (
        <div className="practice">
          <div className={'timer num' + (shown > hi ? ' over' : '')} aria-live="off">
            {limit ? `${Math.max(0, Math.ceil(limit - sec))} s` : `${shown} s`}
            <small>{limit ? 'Temps restant' : `Visez ${lo} à ${hi} secondes`}</small>
          </div>
          {tip && <p className="tip small muted">{tip}</p>}
          {rec.state === 'recording' && <p className="audio-slot" role="status"><Icon name="mic" /> Enregistrement en cours…</p>}
          {rec.state === 'denied' && <p className="small muted">Micro refusé par le navigateur : vous pouvez répondre sans enregistrement.</p>}
          <button className="btn primary" onClick={finish}><Icon name="stop" /> J'ai fini de parler</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="stack">
          <p className="small muted">Vous avez parlé {Math.round(sec)} s{sec < lo ? ' : essayez de développer un peu plus la prochaine fois.' : '.'}</p>
          {rec.url && (
            <div className="stack" style={{ gap: 6 }}>
              <span className="label">Ma réponse</span>
              <audio controls src={rec.url} />
            </div>
          )}
          {mic === 'off' && rec.supported && (
            <button className="ghost" style={{ alignSelf: 'flex-start' }} onClick={() => update(s => ({ ...s, settings: { ...s.settings, mic: 'on' } }))}>
              <Icon name="mic" /> Activer l'enregistrement pour me réécouter
            </button>
          )}
          {!rec.supported && <p className="small muted">Ce navigateur ne permet pas l'enregistrement. Vous pouvez quand même répondre à voix haute.</p>}
          {!autoStart && !limit && (
            <button className="ghost" style={{ alignSelf: 'flex-start' }} onClick={() => { rec.clear(); start() }}>Recommencer</button>
          )}
        </div>
      )}
    </div>
  )
}
