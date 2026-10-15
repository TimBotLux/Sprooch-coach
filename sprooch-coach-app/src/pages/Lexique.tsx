// Lexique d'environ 1 500 mots (PRD §4.0 ter).
import { useDeferredValue, useMemo, useState } from 'react'
import { LEX, type LexWord } from '../data'
import { WordQuiz, type QuizItem } from '../components/WordQuiz'
import { Icon } from '../components/Icon'
import { shuffle } from '../lib/random'
import { useStore } from '../lib/store'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const PAGE = 300
const WORD_INDEX = new Map(LEX.words.map((w, i) => [w, i]))

export function Lexique() {
  const { state, setLex, logActivity, markDone } = useStore()
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(-1)
  const [filter, setFilter] = useState<'all' | 'key' | 'todo' | 'known'>('all')
  const [limit, setLimit] = useState(PAGE)
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null)
  const [run, setRun] = useState(0)
  const q = useDeferredValue(norm(query.trim()))

  const sel = useMemo(() => LEX.words.filter(w => {
    if (theme >= 0 && w[0] !== theme) return false
    if (filter === 'key' && !w[3]) return false
    if (filter === 'todo' && state.lex[w[1]]) return false
    if (filter === 'known' && !state.lex[w[1]]) return false
    if (q && !norm(w[1]).includes(q) && !norm(w[2]).includes(q)) return false
    return true
  }), [q, theme, filter, state.lex])

  const known = LEX.words.filter(w => state.lex[w[1]]).length
  const groups = useMemo(() => {
    const m = new Map<number, LexWord[]>()
    for (const w of sel.slice(0, limit)) { if (!m.has(w[0])) m.set(w[0], []); m.get(w[0])!.push(w) }
    return [...m.entries()]
  }, [sel, limit])

  const startQuiz = () => {
    if (!sel.length) return
    setQuiz(shuffle(sel).slice(0, 10).map(w => ({ prompt: w[2], answer: w[1] })))
    setRun(r => r + 1)
  }

  if (quiz) {
    return (
      <>
        <h1>Lexique<small>{theme >= 0 ? LEX.themes[theme] : 'Sélection du lexique'}</small></h1>
        <WordQuiz
          key={run}
          title={theme >= 0 ? LEX.themes[theme] : 'Lexique'}
          mode="mot"
          items={quiz}
          onFinish={(_s, _m, said) => { setLex(said, true); markDone('vocab') }}
          onAgain={startQuiz}
          onExit={() => setQuiz(null)}
          againLabel="10 autres mots"
          exitLabel="Retour au lexique"
          resultHint={() => 'Les mots bien dits sont cochés dans le lexique.'}
        />
      </>
    )
  }

  return (
    <>
      <h1>Lexique<small>Environ 1 500 mots classés par thème de l'examen.</small></h1>
      <section className="card tight">
        <p className="small muted">Les <b style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>mots en gras</b> sont les mots clés pour répondre à l'examinateur (sélection selon les thèmes du Sproochentest, pas une liste officielle). Cochez un mot quand vous savez le <b>dire</b> sans regarder.</p>
        <input className="field" type="search" value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE) }} placeholder="Chercher un mot en luxembourgeois ou en français" aria-label="Chercher un mot" />
        <div className="row2">
          <select className="field" value={theme} onChange={e => { setTheme(Number(e.target.value)); setLimit(PAGE) }} aria-label="Thème">
            <option value={-1}>Tous les thèmes</option>
            {LEX.themes.map((t, i) => <option key={t} value={i}>{t}</option>)}
          </select>
          <select className="field" value={filter} onChange={e => { setFilter(e.target.value as typeof filter); setLimit(PAGE) }} aria-label="Filtre">
            <option value="all">Tous les mots</option>
            <option value="key">Seulement les mots clés (gras)</option>
            <option value="todo">Mots à apprendre</option>
            <option value="known">Mots que je sais dire</option>
          </select>
        </div>
        <div className="between small muted num"><span>{sel.length} mot{sel.length > 1 ? 's' : ''} affiché{sel.length > 1 ? 's' : ''}</span><span>Je sais dire : {known} / {LEX.words.length}</span></div>
        <button className="btn speak" onClick={startQuiz} disabled={!sel.length}><Icon name="mic" /> S'entraîner à l'oral sur 10 mots de cette sélection</button>
      </section>

      <section className="stack">
        {!sel.length && <p className="hint">Aucun mot ne correspond. Essayez un autre mot ou un autre filtre.</p>}
        {groups.map(([ti, ws]) => {
          const total = LEX.words.filter(w => w[0] === ti)
          const tk = total.filter(w => state.lex[w[1]]).length
          return (
            <section className="lex-group" key={ti}>
              <h3>{LEX.themes[ti]}<span className="num">{tk} / {total.length}</span></h3>
              <div className="minibar"><i style={{ width: `${(tk / total.length) * 100}%` }} /></div>
              <ul className="lex-list">
                {ws.map(w => {
                  const k = !!state.lex[w[1]]
                  const id = `lx-${WORD_INDEX.get(w)}`
                  return (
                    <li key={id}>
                      <input type="checkbox" id={id} checked={k} onChange={() => { setLex([w[1]], !k); if (!k) logActivity(0, 1) }} aria-label={`Je sais dire ${w[1]}`} />
                      <label htmlFor={id} className={'lex-w' + (w[3] ? ' key' : '') + (k ? ' known' : '')} lang="lb">{w[1]}</label>
                      <span className="lex-fr">{w[2]}</span>
                      {w[4] && <span className="lex-note">Passé : {w[4]}</span>}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        {sel.length > limit && (
          <button className="ghost" style={{ alignSelf: 'center' }} onClick={() => setLimit(limit + PAGE)}>Afficher {Math.min(PAGE, sel.length - limit)} mots de plus</button>
        )}
      </section>
    </>
  )
}
