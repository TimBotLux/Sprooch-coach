import { Link } from 'react-router-dom'
import { ALL_QUESTIONS, LEX, LEX_KEYWORDS, VOCAB } from '../data'
import { useProgress } from '../lib/store'

function Ring({ to, label, n, t, color, extra }: { to: string; label: string; n: number; t: number; color: string; extra?: string }) {
  const r = 32
  const c = 2 * Math.PI * r
  const frac = t ? Math.min(1, n / t) : 0
  return (
    <Link className="ring" to={to} aria-label={`${label} : ${n} sur ${t}`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle className="trk" cx="40" cy="40" r={r} />
        <circle className="val" cx="40" cy="40" r={r} style={{ stroke: color, strokeDasharray: c, strokeDashoffset: c * (1 - frac) }} />
        <text className="pct num" x="40" y="45" textAnchor="middle">{Math.round(frac * 100)} %</text>
      </svg>
      <b>{label}</b>
      <small className="num">{n} / {t}{extra && <><br />{extra}</>}</small>
    </Link>
  )
}

/** Les 3 anneaux de progression du prototype. */
export function Rings() {
  const p = useProgress()
  return (
    <div className="rings" aria-label="Ma progression">
      <Ring to="/pas-a-pas" label="Questions maîtrisées" n={p.mastered} t={ALL_QUESTIONS.length} color="var(--ok)" />
      <Ring to="/vocabulaire" label="Exercices de vocabulaire validés" n={p.vocabValidated} t={VOCAB.length * 2} color="var(--accent)" />
      <Ring to="/lexique" label="Mots clés que je sais dire" n={p.keyKnown} t={LEX_KEYWORDS} color="var(--warn)" extra={`tout le lexique : ${p.lexKnown} / ${LEX.words.length}`} />
    </div>
  )
}
