# Sprooch Coach

Application web (PWA) de préparation à l'oral du **Sproochentest**, construite en React à partir du
PRD (`../PRD-Sprooch-Coach.pdf`), du prototype (`../Sprooch-Coach.html`), de la fiche de
déconstruction et du lexique.

Principe : **on répond à voix haute, jamais par écrit.** Pas de QCM et aucune analyse de la voix : l'app donne la bonne réponse quand on la demande, et c'est l'utilisateur qui s'auto-évalue.

## Lancer l'app

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173. Pour la version de production (dossier `dist/`, installable et
utilisable hors ligne) :

```bash
npm run build
npm run preview
```

Le micro ne fonctionne que sur `localhost` ou en HTTPS.

## Architecture

Selon la charte graphique (`../design/`) : une seule colonne de 720 px, un en-tête commun (titre,
3 anneaux, avertissement) et trois onglets **Pas à pas · Vocabulaire · Lexique**. Les autres modules
(plan du jour, simulation, image, révisions, grammaire, progression, réglages) s'ouvrent depuis le
bouton « ⋯ » de l'en-tête. Couleurs, tailles et rayons : `src/styles/tokens.css` (copie de
`design/sprooch-coach-tokens.css`) ; polices Young Serif et Figtree servies localement depuis
`src/assets/fonts` (licence OFL), donc disponibles hors ligne.

## Modules (référence au PRD)

| Module | PRD | État |
| --- | --- | --- |
| Premier lancement : langue, niveau estimé, date d'examen | §6 | Fait (interface en français ; anglais prévu) |
| Aujourd'hui : plan du jour, compte à rebours, plan à rebours | §4.6, §6 | Fait |
| Pas à pas : 18 chapitres, 212 questions, A1/A2, variantes, relances, déverrouillage à 80 %, mode avancé | §4.0 | Fait |
| Réponse orale : chrono 20–40 s, enregistrement et réécoute, 3 critères, réponse modèle, statut | §4.0 | Fait |
| Répétition espacée des questions maîtrisées (« Toujours maîtrisée » / « J'ai hésité ») | §4.0 | Fait (intervalles 3, 7, 14, 30, 60 jours) |
| « On m'a posé cette question à l'examen » | §4.0 | Fait, en local (pas encore partagé entre utilisateurs) |
| Vocabulaire : 26 familles du lexique (Relecture-lexique-Sprooch-Coach.xlsx), mots clés en gras, Dire le mot (option mots clés seulement) / Faire une phrase (7 familles), mots ratés en priorité | §4.0 bis | Fait |
| Lexique : 1 495 mots, 26 thèmes, 523 mots clés, recherche, filtres, entraînement sur 10 mots | §4.0 ter | Fait |
| Description d'image : 1 image parmi 3, canevas d'aide, enregistrement chronométré | §4.2 | Fait, **photos à ajouter** (voir plus bas) |
| Simulation d'examen : 2 thèmes tirés au sort, entretien + image chronométrés, rapport indicatif | §4.1, §4.5 | Fait pour l'épreuve orale |
| Progression : jours d'affilée, minutes parlées, thèmes non travaillés, historique | §4.6 | Fait |
| Grammaire : fiche de déconstruction, phrase à construire | — | Fait (ajout hors PRD) |
| Réglages : thème clair/sombre, taille du texte, micro, effacement des données | §8 | Fait |
| PWA hors ligne | §8 | Fait (tout le contenu est précaché) |
| Compréhension orale B1 | §4.3 | **Non fait** : nécessite des audios de locuteurs natifs |
| Audio natif des questions et des mots | §4.0, §4.4 | **Non fait** : emplacements prévus (« à enregistrer ») |
| Reconnaissance vocale, transcription, correction automatique de la prononciation | §4.0 bis, §4.1, §10 | **Exclu volontairement** : juger un accent ou une intonation est peu fiable et pourrait induire en erreur, même de bons locuteurs. L'app donne la bonne réponse à la demande, l'utilisateur s'auto-évalue. |
| Comptes, synchronisation, hébergement UE | §10 | **Non fait** : tout est local au navigateur pour l'instant |

## Confidentialité

- Les enregistrements vocaux restent **en mémoire** sur l'appareil et sont effacés quand on quitte
  l'exercice. Rien n'est envoyé. Un consentement est demandé avant le premier enregistrement.
- La progression est stockée dans le navigateur (`localStorage`, clé `sproochcoach.app.v1`) et peut
  être effacée depuis les réglages.

## Contenu

- `src/data/chapters.json`, `vocab.json`, `lexique.json`, `grammaire.json` : extraits du prototype
  `Sprooch-Coach.html`.
- `src/data/images.ts` : les 6 scènes de description d'image. Déposez des photos libres de droits
  dans `public/images/` sous le nom indiqué (`scene-marche.jpg`, etc.). Sans photo, l'app affiche la
  description de la scène.
- **Tout le luxembourgeois est un premier jet à faire relire par un locuteur natif** (PRD §9), y
  compris les mots et amorces ajoutés pour la description d'image.

## Structure

```
src/
  App.tsx              navigation (barre du bas) et routes
  data/                contenu pédagogique
  lib/store.tsx        état de l'app, persistance, déverrouillage, répétition espacée
  lib/useRecorder.ts   enregistrement au micro (MediaRecorder)
  components/          QuestionCard, SpeakPanel, WordQuiz, Rings, MicConsent…
  pages/               un fichier par écran
```
