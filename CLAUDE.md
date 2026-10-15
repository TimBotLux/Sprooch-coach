# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sprooch Coach: a PWA to prepare the oral part of the **Sproochentest** (Luxembourgish language test for naturalisation). The user is French-speaking and non-technical: reply in French, explain plainly, and ask before decisions that are theirs (content, scope, design). All UI text is French; learning content is Luxembourgish (`lang="lb"`).

Repository root holds the source documents; the app lives in `sprooch-coach-app/`:

| Path | Role |
| --- | --- |
| `PRD-Sprooch-Coach.pdf` | Product requirements (v0.1). A v0.2 without speech recognition exists as a Claude Doc. |
| `design/` | **Source of truth for look and layout**: `Charte-graphique-Sprooch-Coach.html`, `sprooch-coach-tokens.css`, `fonts/`, reference screens in `ecrans/` (light + dark). |
| `Relecture-lexique-Sprooch-Coach.xlsx` | Lexicon (1 495 words, 26 themes, "Mot clé" column) + 212 examiner questions, sent to a native speaker for review (Statut / Correction columns). |
| `Sprooch-Coach.html` | Original single-file prototype; the app's JSON data was extracted from it. |
| `Enregistrements-Sprooch-Coach.html` | Standalone page for native speakers recording the audio (lots Q1–Q5, R1–R5, vocab). |
| `Fiche-deconstruction-luxembourgeois.pdf` | 18 grammar sentences, used by the Grammaire page. |

## Commands (run in `sprooch-coach-app/`)

```bash
npm install
npm run dev        # http://localhost:5173 (microphone needs localhost or HTTPS)
npm run build      # tsc -b && vite build → dist/ with service worker
npm run lint
npm run preview    # serve dist/
```

There is no test suite. Verify changes with `npm run build` (type-check) and by driving the app in the browser. A `.claude/launch.json` at the repo root defines the `sprooch-coach` dev server.

## Product rules that constrain the code

- **Oral only, no voice analysis.** No speech recognition, transcription, pronunciation scoring or AI correction — deliberately excluded by the user (an accent judge could mislead good speakers). The app shows the right answer on demand; the learner self-assesses ("Je l'ai bien dit" / "À retravailler", 3 criteria, status À voir → En cours → Maîtrisée). No written input, no multiple choice outside a future listening module.
- **Recordings stay in memory** (`useRecorder` → blob URL, revoked on unmount), only after explicit consent (`settings.mic`: `ask` | `on` | `off`). Never persist or upload audio.
- **No backend.** All progress is in `localStorage` key `sproochcoach.app.v1`. Comments and docs mention Supabase/Firebase only as future options.
- **All Luxembourgish content is a first draft to be reviewed by a native speaker.** Don't invent new Luxembourgish without flagging it to the user.
- Native-speaker audio and listening comprehension (B1) are not built yet; UI shows "Audio d'un locuteur natif : à enregistrer" placeholders.

## Architecture (`sprooch-coach-app/src`)

- **Layout (from the design charter §5):** `App.tsx` renders a shared header (title, `Rings`, prototype warning) and three top tabs — `/` Pas à pas, `/vocabulaire`, `/lexique`. Secondary pages (`/plus` menu, `/aujourdhui`, `/simulation`, `/image`, `/revisions`, `/grammaire`, `/progression`, `/reglages`) render without the header, with a back link. `HashRouter` + `base: './'` so `dist/` works from any static host. First launch shows `Onboarding` until `profile.onboarded`.
- **Data (`data/`):** `chapters.json`, `vocab.json`, `lexique.json`, `grammaire.json` were extracted from `Sprooch-Coach.html`; `data/index.ts` types them and derives everything else:
  - Question ids are a hash of the Luxembourgish text (`hid`), same as the prototype — changing a question's `lb` text resets its saved status.
  - Lexicon words are tuples `[themeIndex, lb, fr, isKey 0/1, pastParticiple]`. "Mots clés" (`isKey`) are what the UI shows in bold.
  - `FAMILIES` = the 26 lexicon themes; each gets the "Faire une phrase" prompts and colour swatches of the matching prototype theme via `PROTO_TO_FAMILY`. The Vocabulaire tab trains on families; vocab scores are stored under `lex-<index>`.
  - `images.ts`: scenes for picture description; photos go in `public/images/<file>` and fall back to the text description when missing.
- **State (`lib/store.tsx`):** one React context with persistence. Holds question statuses with spaced repetition (`REVIEW_STEPS` 3/7/14/30/60 days; `reviewQ` false → back to "En cours"), vocab scores + missed words (drawn first next time), known lexicon words, daily activity (seconds spoken), simulations, daily-plan ticks (`markDone`). Selectors: `isUnlocked` (chapter unlocks when 80 % of the previous one is at least "En cours"; exam themes after the 3 intro chapters; or `settings.unlock`), `dueReviews`, `useProgress`.
- **Speaking flow:** `SpeakPanel` (timer + optional recording + consent dialog) is reused by `QuestionCard` (Pas à pas, Révisions), the picture page and the simulation (`limit` = hard stop, no retry). `WordQuiz` is the shared "say the word / make a sentence" exercise used by Vocabulaire and Lexique.
- **Styling:** plain CSS, no framework. `styles/tokens.css` is a copy of `design/sprooch-coach-tokens.css` with local `@font-face` (fonts in `assets/fonts`, OFL) instead of Google Fonts; `index.css` holds component classes named after the prototype (`.card`, `.seg`, `.chapter`, `.q`, `.practice`, `.rings`, `.lex-*`). Dark mode = `prefers-color-scheme` or `data-theme` on `<html>` (set early by an inline script in `index.html`). Use the tokens; colours carry meaning (blue action, green done, orange in progress) and must not be used decoratively.
- **PWA:** `vite-plugin-pwa` precaches all assets incl. JSON and `.ttf` (see `globPatterns` in `vite.config.ts`).

## Conventions

- Keep the design charter's rules: one primary (filled blue) button per screen, Young Serif for Luxembourgish text and titles, Figtree for UI, cards with 1 px border and 14 px radius, no shadows, single 720 px column.
- `sprooch-coach-app/README.md` holds a table mapping each PRD section to its implementation status; update it when scope changes.
- Git: local repository only (no remote), author identity is the machine's global config. Commit only when the user asks ("enregistre une version").
