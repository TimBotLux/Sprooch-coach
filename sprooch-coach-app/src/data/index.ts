// Contenu pédagogique repris du prototype (Sprooch-Coach.html) et de la fiche de déconstruction.
// Premier jet : tout le luxembourgeois doit être relu par un locuteur natif (PRD §9).
import chaptersJson from './chapters.json'
import vocabJson from './vocab.json'
import lexiqueJson from './lexique.json'
import grammaireJson from './grammaire.json'

export type Level = 'A1' | 'A2'

export interface Question {
  id: string
  lv: Level
  /** Question en luxembourgeois (vouvoiement, formulation de l'examen) */
  lb: string
  fr: string
  /** Réponse modèle et sa traduction */
  m: string
  mf: string
  /** Autre formulation possible de l'examinateur */
  v?: string
}

export interface Chapter {
  index: number
  title: string
  sub: string
  qs: Question[]
}

export interface VocabTheme {
  key: string
  label: string
  swatch?: boolean
  /** [luxembourgeois, français, couleur éventuelle] */
  items: [string, string, string?][]
  /** [consigne en français, exemple de réponse] */
  phrases: [string, string][]
}

/** [indice du thème, luxembourgeois, français, mot clé 0/1, passé composé] */
export type LexWord = [number, string, string, number, string]

// Même identifiant que le prototype, pour garder la correspondance des questions.
function hid(t: string): string {
  let h = 5381
  for (const ch of t) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0
  return 'q' + h.toString(36)
}

type RawQuestion = Omit<Question, 'id'>
type RawChapter = { title: string; sub: string; qs: RawQuestion[] }

export const CHAPTERS: Chapter[] = (chaptersJson as unknown as RawChapter[]).map((c, index) => ({
  index,
  title: c.title,
  sub: c.sub,
  qs: c.qs.map(q => ({ ...q, id: hid(q.lb) })),
}))

export const ALL_QUESTIONS: Question[] = CHAPTERS.flatMap(c => c.qs)
export const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map(q => [q.id, q]))
export const CHAPTER_OF = new Map(CHAPTERS.flatMap(c => c.qs.map(q => [q.id, c.index] as const)))

/** Les 3 premiers chapitres forment l'introduction ; les suivants sont les thèmes d'examen. */
export const INTRO_CHAPTERS = 3

type RawVocab = Record<string, Omit<VocabTheme, 'key'>>
export const VOCAB: VocabTheme[] = Object.entries(vocabJson as unknown as RawVocab).map(([key, v]) => ({ key, ...v }))
export const VOCAB_BY_KEY = new Map(VOCAB.map(v => [v.key, v]))

export const LEX = lexiqueJson as unknown as { themes: string[]; words: LexWord[] }
export const LEX_KEYWORDS = LEX.words.filter(w => w[3]).length

export interface GramSection { t: string; ps: [string, string, string][] }
export const GRAMMAR = grammaireJson as unknown as {
  sections: GramSection[]
  swap: Record<'p' | 'o' | 'v', [string, string, string, string][]>
}

/** Relances à travailler dans tous les chapitres (PRD §4.0). */
export const RELANCES: [string, string][] = [
  ['Firwat?', 'pourquoi ?'],
  ['Zënter wéini?', 'depuis quand ?'],
  ['Mat wiem?', 'avec qui ?'],
  ['Wéi oft?', 'à quelle fréquence ?'],
  ['Erzielt mol!', 'racontez !'],
  ['Wat ass besser?', "qu'est-ce qui est mieux ?"],
]

/** Les 3 critères d'auto-évaluation d'une réponse orale (PRD §4.0). */
export const CRITERIA = [
  "J'ai répondu par une phrase complète, pas un seul mot.",
  "J'ai ajouté un détail : quand, où, pourquoi ou avec qui.",
  "J'ai parlé sans regarder de texte et sans longue pause.",
]
