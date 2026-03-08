# ClinIQ — Claude Code Implementation Prompt

> **What this is**: A complete implementation spec for ClinIQ, a medical diagnosis game for Indian MBBS students and NEET-PG aspirants. Think LeetCode for clinical reasoning. Read every section before writing a single line of code.

---

## 1. PRODUCT VISION

ClinIQ is a clinical reasoning game where medical students diagnose patients efficiently. The core philosophy is: **diagnosis is a decision tree, not a checklist.** The game rewards efficient reasoning — every unnecessary investigation costs points. A student who diagnoses correctly using 2 history questions, a focused exam, and one targeted investigation beats a student who orders everything.

**Target users**: Indian MBBS students (years 3–5) and NEET-PG aspirants.

**The core loop**:
```
Read patient presentation → Investigate (history/exam/labs/imaging) → Build differential → Submit diagnosis → See debrief
```

**The emotional arc per case**: Curiosity → uncertainty → conviction → gratification (or humbling). The game should feel like solving a mystery, not taking a test.

---

## 2. TECH STACK

```
Frontend:   React 18 + TypeScript + Vite
Styling:    Tailwind CSS v3 + custom CSS variables (no component libraries)
Routing:    React Router v6
State:      Zustand (global game state + user profile)
Animation:  Framer Motion
Icons:      Lucide React
Data:       Static JSON file (cases loaded at startup, no backend needed for MVP)
Storage:    localStorage (user progress, ELO, streak, case history)
Fonts:      Google Fonts — use distinctive medical/editorial fonts
Build:      Vite with TypeScript strict mode
```

**No backend required for MVP.** All state is localStorage. The Anthropic API integration (for AI case generation) is a post-MVP feature — do not implement it now.

---

## 3. DATA MODEL

The case data is a JSON file (`/src/data/cases.json`) with this top-level structure:

```typescript
interface CaseBundle {
  version: string;
  total_cases: number;
  cases: Case[];
}

interface Case {
  id: string;
  title: string;
  specialty: 'Cardiology' | 'Neurology' | 'Pulmonology' | 'Gastroenterology' | 'Infectious Disease';
  difficulty: 'Intern' | 'Resident' | 'Attending';
  urgency: 'high' | 'medium' | 'low';
  patient: {
    name: string;
    age: number;
    gender: 'M' | 'F';
    occupation: string;
  };
  presentation: string;
  correct_diagnosis: string;
  diagnosis_aliases: string[];
  india_context: string;
  history_cards: HistoryCard[];
  exam_regions: ExamRegion[];
  lab_panels: LabPanel[];
  imaging_options: ImagingOption[];
  differential_decoys: string[];
  optimal_path: {
    history_ids: string[];
    exam_ids: string[];
    lab_ids: string[];
    imaging_ids: string[];
    explanation: string;
  };
  debrief: Debrief;
  related_cases: RelatedCase[];
  tier_costs: { history: number; exam: number; labs: number; imaging: number };
}

interface HistoryCard {
  id: string;
  question: string;
  answer: string;
  yield: 'high' | 'medium' | 'low';
  hint_value: string;
}

interface ExamRegion {
  region: string;
  findings: { id: string; name: string; result: string; yield: 'high' | 'medium' | 'low' }[];
}

interface LabPanel {
  panel: string;
  tests: {
    id: string;
    name: string;
    value: string;
    normal_range: string;
    flag: 'normal' | 'high' | 'low' | 'critical';
    yield: 'high' | 'medium' | 'low';
  }[];
}

interface ImagingOption {
  id: string;
  modality: string;
  region: string;
  cost_points: number;
  report: string;
  yield: 'high' | 'medium' | 'low';
}

interface Debrief {
  pathophysiology: string;
  classic_presentation: string;
  key_discriminators: string[];
  common_mimics: { name?: string; reason?: string }[] | string[];
  treatment: string;
  clinical_pearl: string;
  attendings_note: string;
  india_context: string;
  learning_tags: string[];
}

interface RelatedCase {
  label: string;
  teaser: string;
  teaches: string;
}
```

**User state** (localStorage key: `cliniq_user`):

```typescript
interface UserState {
  name: string;
  yearOfStudy: '3rd Year' | '4th Year' | '5th Year' | 'Intern' | 'PG Aspirant';
  specialtyPreferences: string[];
  eloRating: number;           // starts at 1000
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;      // ISO date string
  totalCasesPlayed: number;
  totalCorrectFirst: number;
  caseHistory: CaseHistoryEntry[];
  badges: string[];
  weeklyScore: number;
  weekStart: string;
}

interface CaseHistoryEntry {
  caseId: string;
  caseTitle: string;
  specialty: string;
  difficulty: string;
  correctDiagnosis: string;
  studentDiagnosis: string;
  wasCorrect: boolean;
  attemptsUsed: number;
  finalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  eloChange: number;
  playedAt: string;
  investigationsUsed: {
    history: string[];
    exam: string[];
    labs: string[];
    imaging: string[];
  };
}
```

---

## 4. SCORING SYSTEM

```typescript
function calculateScore(session: GameSession): ScoringResult {
  let score = 500; // base
  
  // Deductions
  score -= session.historyAsked.length * 5;
  score -= session.examPerformed.length * 10;
  score -= session.labsOrdered.length * 20;
  score -= session.imagingOrdered.length * 35;
  
  // Diagnosis bonus
  const diagnosisBonus = 
    session.attempts === 1 ? 200 :
    session.attempts === 2 ? 100 :
    session.attempts === 3 ? 50 : 0;
  score += diagnosisBonus;
  
  // Differential bonus: +50 if correct diagnosis was on differential before submitting
  if (session.differentialIncludedCorrect) score += 50;
  
  score = Math.max(0, score);
  
  const grade =
    score >= 450 ? 'A+' :
    score >= 350 ? 'A' :
    score >= 250 ? 'B' :
    score >= 150 ? 'C' : 'F';
  
  // ELO change
  const eloChange =
    grade === 'A+' ? 25 :
    grade === 'A' ? 15 :
    grade === 'B' ? 5 :
    grade === 'C' ? -5 : -20;
  
  return { score, grade, eloChange, diagnosisBonus };
}

function matchDiagnosis(input: string, correct: string, aliases: string[]): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedInput = normalize(input);
  return [correct, ...aliases].some(d => normalize(d) === normalizedInput || 
    normalizedInput.includes(normalize(d)) || normalize(d).includes(normalizedInput));
}
```

---

## 5. APPLICATION ROUTES

```
/                   → Home / Dashboard
/onboarding         → First-time setup (3 screens)
/cases              → Case browser (filter by specialty/difficulty)
/case/:id           → Active game session
/case/:id/debrief   → Post-case debrief (read-only after completion)
/profile            → User profile + badge collection
/leaderboard        → Weekly global leaderboard (mocked data)
/history            → Full case history
```

---

## 6. SCREEN-BY-SCREEN SPECIFICATIONS

### 6.1 ONBOARDING (3 screens, shown only once)

**Screen 1 — Welcome**
- Large ClinIQ logo/wordmark
- Tagline: "Think like a doctor. Not like a student."
- Single CTA: "Let's start"

**Screen 2 — About You**
- "What year are you in?" — single select pill buttons: 3rd Year / 4th Year / 5th Year / Intern / PG Aspirant
- "Your name?" — text input
- "Next" button

**Screen 3 — Specialty Preferences**
- "Which specialties interest you most?" — multi-select cards with specialty icon
- Options: Cardiology, Neurology, Pulmonology, Gastroenterology, Infectious Disease (all pre-selected)
- "Start playing" CTA
- Small text: "You can change this anytime in settings"

On completion: initialise UserState in localStorage, redirect to `/`.

---

### 6.2 HOME / DASHBOARD

This is the main hub. Layout:

**Top section — Status bar**
- Left: User name + ELO rating badge (e.g., "Resident · 1024")
- Right: Streak flame icon + number

**Hero card — Case of the Day**
- Prominent card with specialty color accent
- Patient vignette preview (first 2 lines only, truncated)
- Specialty tag + difficulty badge
- "Play Today's Case" CTA button
- If already played: show score/grade earned, greyed out

**Quick Stats Row** (3 cards)
- Cases played
- Accuracy rate (% correct on first attempt)
- Current streak

**Recent Cases** — horizontal scroll of last 3 played cases with grade badge

**Browse Cases** — grid of specialty cards to navigate to case browser

**Leaderboard Preview** — top 3 users this week (mocked), link to full leaderboard

---

### 6.3 CASE BROWSER (`/cases`)

Filter bar at top:
- Specialty: All / Cardiology / Neurology / Pulmonology / Gastroenterology / Infectious Disease
- Difficulty: All / Intern / Resident / Attending
- Status: All / Unplayed / Played / Incorrect

Case grid — each card shows:
- Specialty color strip on left
- Case title
- Patient line: "58M · Retired principal"
- Specialty + Difficulty badge
- Urgency indicator (red/yellow/green dot)
- If played: grade badge (A+/A/B/C/F) in corner
- If played correctly: subtle checkmark

Clicking a card → `/case/:id`

---

### 6.4 ACTIVE GAME SESSION (`/case/:id`)

This is the most complex screen. It has a persistent layout with a left panel and right panel.

**LEFT PANEL (fixed, ~340px)**

Top section:
- Patient card: name, age/gender, occupation
- Full presentation text (the vignette)
- Score tracker: current score (starts 500, decrements live as they investigate)
- Attempts remaining: 3 dots (filled = used)

Differential panel (below patient card):
- Label: "Your Differential"
- Text input: type a diagnosis to add to differential list
- Listed diagnoses as tags with ✕ to remove
- Subtle note: "+50 pts if correct dx is on your differential before submitting"

Diagnosis submission (bottom of left panel):
- Appears after at least 1 investigation in each tier, OR after 3+ investigations total
- Text input with autocomplete (fuzzy match against all diagnoses in cases.json)
- "Submit Diagnosis" button (primary, prominent)
- 3 attempt indicators below

**RIGHT PANEL (scrollable)**

Tab bar: History | Exam | Labs | Imaging

Each tab opens a different investigation interface:

**History tab:**
- 6 card deck, displayed as a grid of face-down cards
- Each card shows only "Ask about..." with a vague label on the back (e.g., "Pain character", "Past history")
- Click a card → it flips (CSS 3D flip animation) and reveals the patient's answer
- Cost indicator: "−5 pts" shown on hover before clicking
- Cards already flipped are shown as answered (different visual state)
- Yield indicator shown AFTER flipping: green dot (high), yellow (medium), grey (low)

**Exam tab:**
- Body regions listed as buttons/cards: Vitals, Cardiac, Chest, Abdomen, Neuro, Extremities
- Clicking a region expands it and reveals findings (each finding costs −10 pts)
- Findings listed individually — click each to reveal result
- Already-examined findings shown with result visible

**Labs tab:**
- EMR-style panel grouped by category (Cardiac Markers, Haematology, Metabolic, etc.)
- Checkboxes for each test
- "Order Selected Tests" button at bottom (one click orders all checked tests)
- Each test deducts −20 pts when ordered
- Ordered tests show value + flag (colour-coded: red = critical, orange = high/low, green = normal)
- Normal range shown in small text below

**Imaging tab:**
- Cards for each available imaging option: modality + region + cost shown
- Single click to order: −35 pts deducted
- After ordering: report text appears in an expandable card (like an actual radiology report)
- Ordered imaging cards get a "Reported" badge

**Score deduction animation**: whenever a cost is incurred, the score in the left panel should animate down (number counter animation).

---

### 6.5 DIAGNOSIS SUBMISSION FLOW

When student submits a diagnosis:

**Attempt 1 — Correct:**
- Green burst animation on the score display
- "Correct! 🎯" toast notification
- Show final score + grade prominently
- ELO change shown (+25 etc.)
- CTA: "See Debrief" (auto-redirects after 3 seconds or on click)

**Attempt 1 — Incorrect:**
- Red shake animation on score
- "Not quite. 2 attempts remaining." message
- Score deduction shown (no bonus points applied yet)
- User can continue investigating before next attempt

**Attempt 2 — same flow**

**All 3 attempts failed:**
- "Case closed." message
- Reveal correct diagnosis
- Grade: F, ELO: −20
- CTA: "See What Went Wrong" → debrief

---

### 6.6 DEBRIEF SCREEN (`/case/:id/debrief`)

Full-page debrief. This is the learning moment — make it feel like reading a great medical textbook.

**Header**: Case title + patient line + final grade badge

**Section 1 — Your Performance**
- Side-by-side comparison: "Your path" vs "Optimal path"
- Your path: list of investigations you ran with costs
- Optimal path: minimum investigations needed, with explanation
- Score breakdown: base 500, deductions itemised, bonuses

**Section 2 — The Diagnosis**
- Correct diagnosis in large type
- Your diagnosis (if wrong: shown struck through in red next to correct)

**Section 3 — Pathophysiology**
- Mechanism in 2–3 sentences (from `debrief.pathophysiology`)
- Classic presentation (from `debrief.classic_presentation`)

**Section 4 — Key Discriminators**
- 4 bullet points as visual cards/chips (from `debrief.key_discriminators`)

**Section 5 — Common Mimics**
- 3 disease cards, each showing disease name + why it's confusing

**Section 6 — Treatment**
- Treatment text in a highlighted box

**Section 7 — Clinical Pearl** ⭐
- Single memorable teaching point in a visually distinct callout card

**Section 8 — Attending's Note** 👨‍⚕️
- Full text, styled like a letter or annotation
- Different background, different font treatment — this is the most important section

**Section 9 — India Context** 🇮🇳
- Small section with epidemiology relevance

**Section 10 — Learning Tags**
- Tag cloud: cognitive bias tags, clinical tags

**Section 11 — Related Cases**
- 3 cards linking to related cases (if those cases exist in the data)
- Each shows: label, teaser, what it teaches

**Bottom CTA**: "Next Case →" or "Back to Dashboard"

---

### 6.7 PROFILE SCREEN (`/profile`)

- Avatar placeholder with user name + year
- ELO rating with rank label: Intern (<1100) / Resident (1100–1300) / Fellow (1300–1500) / Attending (>1500)
- Stats: cases played, accuracy %, best streak, favourite specialty
- **Badge collection**: grid of all 10 MVP badges — earned ones lit up, unearned ones greyed out with lock icon

**Badges:**
| Badge | Icon | Criteria |
|-------|------|----------|
| First Blood | 🩸 | Complete first case |
| On a Roll | 🔥 | 3-day streak |
| Committed | 💪 | 7-day streak |
| Speed Diagnosis | ⚡ | Score > 400 (minimal investigations) |
| First Try | 🎯 | Correct on first attempt |
| Differential Thinker | 🧠 | Earn differential bonus 5 times |
| Zebra Hunter | 🦓 | Complete an Attending-difficulty case correctly |
| Specialist | 🏆 | Complete 5 cases in one specialty |
| High Scorer | ⭐ | Achieve grade A+ |
| Sharp Eyes | 👁️ | Complete 10 cases total |

---

### 6.8 LEADERBOARD (`/leaderboard`)

- Weekly leaderboard (resets Sunday midnight)
- Mocked with 20 realistic Indian student names + scores
- Current user highlighted in the list
- Top 3 get gold/silver/bronze crown icons
- Tabs: This Week / All Time
- Each row: rank, name, ELO rating, cases played this week, accuracy %

---

### 6.9 CASE HISTORY (`/history`)

- Full list of all played cases, reverse chronological
- Filter by: specialty, grade, correct/incorrect, date range
- Each row: case title, specialty, date, student diagnosis, correct diagnosis, score, grade
- Click row → opens debrief (read-only)
- Summary stats at top: total played, accuracy rate, avg score

---

## 7. UI DESIGN DIRECTION

**Aesthetic**: Clinical + Editorial. Think a premium medical journal crossed with a game interface. Not playful/childish. Not sterile/clinical grey. Authoritative but engaging.

**Color palette** (CSS variables):
```css
:root {
  --bg-primary: #0a0f1e;        /* Deep navy — main background */
  --bg-surface: #111827;        /* Slightly lighter surface */
  --bg-card: #1a2235;           /* Card backgrounds */
  --bg-elevated: #1f2d45;       /* Elevated cards, modals */
  
  --accent-primary: #2dd4bf;    /* Teal — primary actions, highlights */
  --accent-secondary: #f59e0b;  /* Amber — scores, warnings, streak */
  --accent-danger: #ef4444;     /* Red — critical values, wrong answers */
  --accent-success: #10b981;    /* Green — correct, normal values */
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  
  /* Specialty colors */
  --cardiology: #ef4444;
  --neurology: #8b5cf6;
  --pulmonology: #3b82f6;
  --gastroenterology: #f59e0b;
  --infectious: #10b981;
  
  /* Grade colors */
  --grade-aplus: #fbbf24;
  --grade-a: #10b981;
  --grade-b: #3b82f6;
  --grade-c: #f59e0b;
  --grade-f: #ef4444;
}
```

**Typography:**
- Display/headings: `Syne` (Google Fonts) — geometric, authoritative
- Body text: `DM Sans` (Google Fonts) — clean, readable
- Monospace (lab values, reports): `JetBrains Mono` (Google Fonts)
- Medical report text (imaging reports): slight italic, monospace feel

**Key UI patterns:**
- Cards have subtle border: `border: 1px solid rgba(255,255,255,0.08)`
- Active/hover states: teal glow `box-shadow: 0 0 0 2px var(--accent-primary)`
- Lab value flags: red background chips for critical, orange for high/low, grey for normal
- Score counter: large, monospace, amber color — should feel like a countdown timer
- Grade badges: pill shaped, color-coded
- Specialty tags: colored left border or dot

**Animations (Framer Motion):**
- History card flip: `rotateY` 3D transform
- Score decrement: number counter animation (animate from old to new value)
- Correct answer: green pulse/burst on score display
- Wrong answer: red shake on score display
- Page transitions: subtle fade + slight upward translate
- Debrief sections: staggered reveal as user scrolls

---

## 8. COMPONENT ARCHITECTURE

```
src/
├── main.tsx
├── App.tsx                    # Router setup
├── data/
│   └── cases.json             # The full case bundle (159KB)
├── types/
│   └── index.ts               # All TypeScript interfaces
├── store/
│   ├── userStore.ts           # Zustand — user profile, ELO, streak
│   └── gameStore.ts           # Zustand — active game session state
├── utils/
│   ├── scoring.ts             # calculateScore, matchDiagnosis
│   ├── elo.ts                 # ELO calculation helpers
│   ├── badges.ts              # Badge unlock logic
│   └── streak.ts              # Streak management
├── hooks/
│   ├── useCase.ts             # Load case by ID, case navigation
│   └── useGameSession.ts      # Active session management
├── components/
│   ├── ui/
│   │   ├── Badge.tsx          # Grade badge (A+/A/B/C/F)
│   │   ├── SpecialtyTag.tsx   # Colored specialty label
│   │   ├── DifficultyBadge.tsx
│   │   ├── ScoreCounter.tsx   # Animated score display
│   │   ├── EloDisplay.tsx
│   │   └── StreakBadge.tsx
│   ├── game/
│   │   ├── PatientCard.tsx    # Left panel patient info
│   │   ├── DifferentialPanel.tsx
│   │   ├── DiagnosisInput.tsx # With autocomplete
│   │   ├── HistoryTab.tsx     # Card deck
│   │   ├── HistoryCard.tsx    # Individual flippable card
│   │   ├── ExamTab.tsx        # Body regions
│   │   ├── LabsTab.tsx        # EMR-style panel
│   │   ├── ImagingTab.tsx     # Imaging cards
│   │   └── InvestigationTabs.tsx
│   ├── debrief/
│   │   ├── PerformanceComparison.tsx
│   │   ├── PathophysiologySection.tsx
│   │   ├── DiscriminatorsSection.tsx
│   │   ├── MimicsSection.tsx
│   │   ├── AttendingNote.tsx
│   │   └── RelatedCasesSection.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── PageWrapper.tsx
├── pages/
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── CaseBrowser.tsx
│   ├── GameSession.tsx
│   ├── Debrief.tsx
│   ├── Profile.tsx
│   ├── Leaderboard.tsx
│   └── History.tsx
```

---

## 9. GAME STATE MANAGEMENT (Zustand)

```typescript
// store/gameStore.ts
interface GameState {
  currentCase: Case | null;
  sessionId: string | null;
  
  // Investigations
  historyAsked: string[];      // card IDs
  examPerformed: string[];     // finding IDs
  labsOrdered: string[];       // test IDs
  imagingOrdered: string[];    // imaging IDs
  
  // Diagnosis
  differential: string[];
  diagnosisAttempts: string[]; // student's submitted diagnoses
  isCorrect: boolean | null;
  isComplete: boolean;
  
  // Scoring
  currentScore: number;        // starts 500, decrements
  differentialIncludedCorrect: boolean;
  
  // Actions
  askHistory: (id: string) => void;
  performExam: (id: string) => void;
  orderLab: (id: string) => void;
  orderImaging: (id: string) => void;
  addToDifferential: (diagnosis: string) => void;
  removeFromDifferential: (diagnosis: string) => void;
  submitDiagnosis: (diagnosis: string) => SubmissionResult;
  startCase: (caseData: Case) => void;
  resetSession: () => void;
}
```

---

## 10. KEY IMPLEMENTATION DETAILS

### Diagnosis matching
Must be fuzzy and generous. Use a normalize function that strips punctuation, lowercases, and then checks:
1. Exact match after normalization
2. Input contains the correct answer (after normalization)
3. Correct answer contains the input (after normalization)
4. Check all aliases

```typescript
function matchDiagnosis(input: string, correct: string, aliases: string[]): boolean {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const ni = n(input);
  return [correct, ...aliases].some(d => {
    const nd = n(d);
    return ni === nd || ni.includes(nd) || nd.includes(ni);
  });
}
```

### Streak logic
```typescript
function updateStreak(lastPlayed: string, current: number): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastPlayed === today) return current; // already played today
  if (lastPlayed === yesterday) return current + 1; // consecutive
  return 1; // streak broken, reset to 1
}
```

### Case of the Day
Use a deterministic seed based on the date so all users get the same case:
```typescript
function getCaseOfTheDay(cases: Case[]): Case {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % cases.length;
  return cases[index];
}
```

### Autocomplete for diagnosis input
Build an index of all `correct_diagnosis` values + all `diagnosis_aliases` from all cases. On input, filter this list case-insensitively. Show max 6 suggestions in a dropdown.

### Lab value display
Flag colours:
- `critical`: red background chip `bg-red-900 text-red-200`
- `high` or `low`: amber chip `bg-amber-900 text-amber-200`
- `normal`: muted chip `bg-slate-800 text-slate-400`

---

## 11. LEADERBOARD MOCK DATA

Generate 20 realistic entries with Indian names, varying ELO 900–1600, weekly scores. Current user should appear around position 8–12 to feel achievable. Data structure:

```typescript
interface LeaderboardEntry {
  rank: number;
  name: string;
  eloRating: number;
  casesThisWeek: number;
  accuracy: number;
  isCurrentUser: boolean;
}
```

---

## 12. MOBILE RESPONSIVENESS

The game session (left + right panel layout) collapses on mobile:
- Mobile: tabs at bottom nav, patient card collapses to a top strip
- Score always visible in a sticky header
- Differential panel becomes a bottom sheet on mobile
- Diagnosis submission is a sticky bottom bar on mobile

Target: functional and usable on 375px width minimum.

---

## 13. PERFORMANCE NOTES

- Cases JSON is ~160KB — import it statically, not via fetch
- History cards use CSS 3D flip (no JS animation library needed for the flip itself)
- Score counter animation: use a simple requestAnimationFrame counter or Framer Motion's `useMotionValue` + `useTransform`
- Images: none — this is a text-heavy app, no image assets needed
- Fonts: preload the 3 Google Fonts in `index.html`

---

## 14. WHAT NOT TO BUILD (MVP SCOPE)

Do **not** implement these — they are explicitly out of scope:

- Backend / database / authentication
- AI case generation (Anthropic API calls)
- Friend Duels / multiplayer
- Weekly Leagues with promotion/relegation
- Push notifications
- Streak freeze
- Social sharing / WhatsApp card generation
- Educator dashboard
- CME credits
- Spaced repetition system
- Monetization / paywall

---

## 15. IMPLEMENTATION ORDER

Build in this sequence to always have a working app at each stage:

1. **Foundation**: Vite + React + TypeScript setup, Tailwind config, CSS variables, font imports, Router setup, Zustand stores, load cases.json
2. **Onboarding**: 3-screen flow, write to localStorage
3. **Dashboard**: Static layout, Case of the Day card, quick stats (zeroed), navigation links
4. **Case Browser**: Grid with filters, case cards
5. **Game Session**: Full investigation UI — this is the core and will take the most time
   - Patient card + score counter
   - History tab (card flip)
   - Exam tab
   - Labs tab
   - Imaging tab
   - Differential panel
   - Diagnosis submission + matching
6. **Scoring + completion**: Calculate final score, grade, ELO, write to localStorage
7. **Debrief**: All sections, performance comparison
8. **Profile**: Stats, badge grid, badge unlock logic
9. **Case History**: List + filters, link back to debrief
10. **Leaderboard**: Mocked data, current user highlight
11. **Polish**: Animations (Framer Motion), transitions, mobile responsiveness, edge cases

---

## 16. EXAMPLE USAGE FLOW (TEST THIS END-TO-END)

1. Fresh load → Onboarding → set name "Arjun", year "Resident", preferences all selected
2. Dashboard shows Case of the Day (deterministic by date)
3. Click "Play Today's Case" → GameSession loads, score shows 500
4. Click 2 history cards (score drops to 490)
5. Click Vitals in Exam tab, reveal HR and BP (score drops to 470)
6. Switch to Labs, order Troponin (score drops to 450)
7. Switch to Imaging, order ECG (score drops to 415)
8. Type "inferior MI" in differential panel, add it
9. Type "inferior wall MI" in diagnosis input — autocomplete shows — submit
10. Correct → score 415 + 200 (first attempt) + 50 (differential) = 665... capped display correctly
11. Wait: score should be 415 base + bonuses. Verify scoring math.
12. Debrief loads — all sections visible, optimal path shown
13. Profile shows 1 case played, streak 1, ELO 1025, First Blood badge earned

---

## 17. FINAL NOTES FOR CLAUDE CODE

- Write **TypeScript strict mode** throughout. No `any` types.
- Every component should have proper props interfaces.
- Use `useCallback` and `useMemo` where appropriate in game session (it's the most interactive screen).
- The scoring state must be **immutable** — never mutate Zustand state directly.
- The diagnosis matching function is critical — test it against all aliases in the cases.json before considering it done.
- The debrief screen is a **reading experience** — give it generous spacing, good typographic hierarchy, and make the Attending's Note visually distinct from the rest.
- The history card flip is a **signature interaction** — make the 3D CSS flip satisfying and smooth.
- Dark theme only. No light mode toggle in MVP.
- Do not add features not listed here. Build what's specified cleanly rather than adding unasked-for features.
