// Fiche de déconstruction (Fiche-deconstruction-luxembourgeois.pdf).
import { useState } from 'react'
import { GRAMMAR } from '../data'

type K = 'p' | 'o' | 'v'
const LABELS: [K, string][] = [['p', 'À qui'], ['o', 'Quoi'], ['v', 'Verbe']]

export function Grammaire() {
  const [pick, setPick] = useState<Record<K, number>>({ p: 0, o: 0, v: 0 })
  const [sel, setSel] = useState(1)
  const p = GRAMMAR.swap.p[pick.p], o = GRAMMAR.swap.o[pick.o], v = GRAMMAR.swap.v[pick.v]
  const parts: [string, string, string, string][] = [
    ['suj', 'Ech', 'Sujet', '« ech » = je. Le sujet ouvre la phrase.'],
    ['verb', v[1], 'Verbe', v[3]],
    ['dat', p[1], 'Datif · à qui', p[3]],
    ['obj', o[1] + '.', 'Objet · quoi', o[3]],
  ]
  let n = 0

  return (
    <>
      <h1>Grammaire<small>18 phrases qui dévoilent l'essentiel de la grammaire. Dites chaque phrase à voix haute, puis changez un mot pour en fabriquer de nouvelles.</small></h1>

      <section className="card">
        <div className="meta"><span>Construisez la phrase</span><span>Phrase 5 / 18</span></div>
        <div className="fr">Je {v[2]} {o[2]} {p[2]}.</div>
        <div className="chips" lang="lb">
          {parts.map((x, i) => (
            <button key={x[0]} className="chip" data-r={x[0]} aria-pressed={sel === i} onClick={() => setSel(i)}>{x[1]}</button>
          ))}
        </div>
        <div className="stack" style={{ gap: 4, borderTop: '1px solid var(--line)', paddingTop: 12, minHeight: 60 }}>
          <div className="label">{parts[sel][2]}</div>
          <div>{parts[sel][3]}</div>
        </div>
        <div className="label">Changez un mot</div>
        {LABELS.map(([k, label]) => (
          <div className="swap" key={k}>
            <span>{label}</span>
            <div className="seg" role="group" aria-label={label}>
              {GRAMMAR.swap[k].map((x, i) => (
                <button key={x[0]} aria-pressed={pick[k] === i} onClick={() => setPick({ ...pick, [k]: i })}>{x[0]}</button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {GRAMMAR.sections.map(s => (
        <section className="gram-sec" key={s.t}>
          <h3>{s.t}</h3>
          <ol className="gram-list">
            {s.ps.map(ph => (
              <li key={ph[1]}>
                <span className="n num">{++n}</span>
                <span className="lb" lang="lb">{ph[1]}</span>
                <span className="fr">{ph[0]}</span>
                <span className="why">{ph[2]}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="rules">
        <div className="label" style={{ color: 'var(--warn)' }}>Les 5 règles que ces phrases révèlent</div>
        <ol>
          <li><b>Verbe en 2<sup>e</sup> position</b> dans la phrase principale (<span lang="lb">Muer <b>ginn</b> ech …</span>).</li>
          <li><b>Verbe à la fin</b> après « well », « datt », « wann ».</li>
          <li><b>Participe et infinitif à la fin</b> (<span lang="lb">Ech hunn den Apel <b>giess</b></span>).</li>
          <li><b>Règle du « n »</b> : le n final tombe devant une consonne sauf n, d, t, z, h (<span lang="lb">ech hu keen</span> ; mais <span lang="lb">ech hunn den</span>).</li>
          <li><b>Trois articles</b> : den (masculin), d' (féminin et pluriel), dat / d' (neutre). Apprenez chaque nom avec son article.</li>
        </ol>
      </section>
      <p className="small muted">Inspirée de la méthode de « déconstruction » de Tim Ferriss. Premier jet à faire valider par un locuteur natif.</p>
    </>
  )
}
