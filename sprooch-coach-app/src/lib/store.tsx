// État de l'app, conservé uniquement dans le navigateur (localStorage).
// Aucun enregistrement vocal n'est stocké ici : ils restent en mémoire le temps de la séance (PRD §8, RGPD).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ALL_QUESTIONS, CHAPTERS, FAMILIES, INTRO_CHAPTERS, LEX, type Level } from '../data'
import { addDays, dayKey, daysBetween } from './dates'

export type QStatus = 'voir' | 'cours' | 'ok'
export type ThemeMode = 'auto' | 'light' | 'dark'

export interface QState {
  s: QStatus
  /** Prochaine révision (répétition espacée), pour les questions maîtrisées */
  due?: string
  /** Rang dans la suite d'intervalles de révision */
  step?: number
}

export interface SimRecord {
  date: string
  chapter: number
  scene: string
  /** Critères cochés, sur le total possible */
  score: number
  total: number
  seconds: number
}

export interface AppState {
  v: 1
  profile: {
    onboarded: boolean
    examDate?: string
    level?: 'debutant' | 'A1' | 'A2'
  }
  settings: {
    theme: ThemeMode
    fontScale: number
    unlock: boolean
    level: 'all' | Level
    /** Enregistrement au micro : à demander, accepté, refusé (consentement explicite, RGPD) */
    mic: 'ask' | 'on' | 'off'
  }
  q: Record<string, QState>
  vocab: Record<string, { mot?: number; phrase?: number; missed?: string[] }>
  lex: Record<string, true>
  /** Journal par jour : secondes parlées (enregistrées) et exercices faits */
  activity: Record<string, { sec: number; items: number }>
  sims: SimRecord[]
  /** Questions signalées « posées à mon examen » */
  examAsked: Record<string, true>
  /** Tâches du plan du jour faites, par date */
  done: Record<string, PlanTask[]>
}

export type PlanTask = 'vocab' | 'oral' | 'image'

const KEY = 'sproochcoach.app.v1'

const initial: AppState = {
  v: 1,
  profile: { onboarded: false },
  settings: { theme: 'auto', fontScale: 1, unlock: false, level: 'all', mic: 'ask' },
  q: {}, vocab: {}, lex: {}, activity: {}, sims: [], examAsked: {}, done: {},
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    const s = JSON.parse(raw)
    return { ...initial, ...s, profile: { ...initial.profile, ...s.profile }, settings: { ...initial.settings, ...s.settings } }
  } catch {
    return initial
  }
}

/** Intervalles de révision des questions maîtrisées, en jours. */
const REVIEW_STEPS = [3, 7, 14, 30, 60]

function useAppStateInternal() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* stockage indisponible : l'app marche quand même */ }
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === 'auto') delete root.dataset.theme
    else root.dataset.theme = state.settings.theme
    root.style.fontSize = state.settings.fontScale * 100 + '%'
  }, [state.settings.theme, state.settings.fontScale])

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), [])

  const logActivity = useCallback((sec: number, items: number) => {
    const k = dayKey()
    setState(s => {
      const cur = s.activity[k] ?? { sec: 0, items: 0 }
      return { ...s, activity: { ...s.activity, [k]: { sec: cur.sec + sec, items: cur.items + items } } }
    })
  }, [])

  const setQStatus = useCallback((id: string, status: QStatus) => {
    setState(s => {
      const next: QState = status === 'ok' ? { s: 'ok', step: 0, due: addDays(dayKey(), REVIEW_STEPS[0]) } : { s: status }
      return { ...s, q: { ...s.q, [id]: next } }
    })
  }, [])

  /** Révision d'une question maîtrisée : réussie → intervalle plus long ; hésitation → repasse « En cours ». */
  const reviewQ = useCallback((id: string, fluent: boolean) => {
    setState(s => {
      const cur = s.q[id]
      let next: QState
      if (!fluent) next = { s: 'cours' }
      else {
        const step = Math.min((cur?.step ?? 0) + 1, REVIEW_STEPS.length - 1)
        next = { s: 'ok', step, due: addDays(dayKey(), REVIEW_STEPS[step]) }
      }
      return { ...s, q: { ...s.q, [id]: next } }
    })
  }, [])

  const setVocabResult = useCallback((key: string, mode: 'mot' | 'phrase', pct: number, missed: string[], said: string[]) => {
    setState(s => {
      const cur = s.vocab[key] ?? {}
      const prevMissed = (cur.missed ?? []).filter(w => !said.includes(w))
      const allMissed = [...new Set([...missed, ...prevMissed])]
      return { ...s, vocab: { ...s.vocab, [key]: { ...cur, [mode]: Math.max(cur[mode] ?? 0, pct), missed: allMissed } } }
    })
  }, [])

  const setLex = useCallback((words: string[], known: boolean) => {
    setState(s => {
      const lex = { ...s.lex }
      for (const w of words) { if (known) lex[w] = true; else delete lex[w] }
      return { ...s, lex }
    })
  }, [])

  const markDone = useCallback((task: PlanTask) => {
    const k = dayKey()
    setState(s => {
      const cur = s.done[k] ?? []
      return cur.includes(task) ? s : { ...s, done: { ...s.done, [k]: [...cur, task] } }
    })
  }, [])

  const reset = useCallback(() => setState({ ...initial, profile: { onboarded: true }, settings: { ...initial.settings } }), [])

  return { state, update, logActivity, setQStatus, reviewQ, setVocabResult, setLex, markDone, reset }
}

type Store = ReturnType<typeof useAppStateInternal>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAppStateInternal()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore hors de StoreProvider')
  return s
}

/* ---------- Sélecteurs ---------- */

export function qStatus(state: AppState, id: string): QStatus {
  return state.q[id]?.s ?? 'voir'
}

function started80(state: AppState, ci: number): boolean {
  const qs = CHAPTERS[ci].qs
  return qs.filter(q => qStatus(state, q.id) !== 'voir').length / qs.length >= 0.8
}

/** Un chapitre se débloque quand 80 % du précédent est au moins « En cours » ; les thèmes d'examen après l'introduction. */
export function isUnlocked(state: AppState, ci: number): boolean {
  if (ci === 0 || state.settings.unlock) return true
  if (ci < INTRO_CHAPTERS) return isUnlocked(state, ci - 1) && started80(state, ci - 1)
  return isUnlocked(state, INTRO_CHAPTERS - 1) && started80(state, INTRO_CHAPTERS - 1)
}

export function dueReviews(state: AppState): string[] {
  const today = dayKey()
  return ALL_QUESTIONS.filter(q => {
    const st = state.q[q.id]
    return st?.s === 'ok' && st.due && st.due <= today
  }).map(q => q.id)
}

export function useProgress() {
  const { state } = useStore()
  return useMemo(() => {
    const mastered = ALL_QUESTIONS.filter(q => qStatus(state, q.id) === 'ok').length
    const inProgress = ALL_QUESTIONS.filter(q => qStatus(state, q.id) === 'cours').length
    const vocabValidated = FAMILIES.reduce((a, f) => a + ((state.vocab[f.key]?.mot ?? 0) >= 80 ? 1 : 0) + ((state.vocab[f.key]?.phrase ?? 0) >= 80 ? 1 : 0), 0)
    const keyKnown = LEX.words.filter(w => w[3] && state.lex[w[1]]).length
    const lexKnown = LEX.words.filter(w => state.lex[w[1]]).length
    const today = dayKey()
    let streak = 0
    for (let d = state.activity[today] ? today : addDays(today, -1); state.activity[d]; d = addDays(d, -1)) streak++
    const secTotal = Object.values(state.activity).reduce((a, x) => a + x.sec, 0)
    const examIn = state.profile.examDate ? daysBetween(today, state.profile.examDate) : undefined
    return { mastered, inProgress, vocabValidated, keyKnown, lexKnown, streak, secTotal, examIn }
  }, [state])
}
