# AuraCycle V2 — Phase 2A Product Architecture & UX Audit

Status: **Approved direction / implementation not yet started**

Branch: `auracycle-v2-phase1-core-engine`

## Objective

Turn the Phase 1 deterministic engine into a focused, calm, fast cycle-tracking product. Phase 2A is an audit and product specification pass; it intentionally avoids visual churn until the information architecture is agreed.

## Product north star

> Log with minimal friction → understand where you are in the cycle → see a transparent next-period estimate → review your history → keep control of your data.

AuraCycle should not compete on feature count. It should compete on clarity, reliability, privacy, and low-friction daily use.

## Feature disposition

| Area | Decision | Direction |
|---|---|---|
| Period/flow logging | **KEEP + REBUILD UX** | Make logging the fastest action in the product; preserve date editing and deletion. |
| Next-period prediction | **KEEP + ELEVATE** | Make the estimate the primary Home outcome; expose confidence and history basis without overwhelming the user. |
| Cycle history | **KEEP + IMPROVE** | Replace raw/stat-heavy presentation with a clearer timeline and useful trend summaries. |
| Calendar | **KEEP + IMPROVE** | Make logged days, period episodes, current day, and prediction window visually obvious and tappable. |
| Symptoms | **KEEP + SIMPLIFY** | Keep the predefined set; make selection faster and avoid unnecessary taxonomy. |
| Mood | **KEEP + SIMPLIFY** | Keep as optional daily context, not a primary product metric. |
| Notes | **KEEP** | Optional free-text observation; never required. |
| JSON backup/restore | **KEEP + HARDEN** | Preserve local ownership; add explicit validation/error states and backup versioning. |
| CSV export | **KEEP** | Useful for portability; make it secondary to JSON backup. |
| Starting baseline settings | **SIMPLIFY** | Keep only when history is insufficient; clearly label them as temporary starting estimates. |
| Privacy messaging | **KEEP + REFRAME** | Communicate privacy confidently without repeating infrastructure language throughout the UI. |
| AI/Gemini | **REMOVE** | No return to the V1 AI dependency. |
| Cloud/account system | **REMOVE** | Not part of the current V2 product strategy. |
| Ads/tracking | **REMOVE** | Maintain the private, local product position. |

## Current UX problems found

### 1. Home is too infrastructure-heavy

The first major block currently leads with `[01] Infrastructure & Privacy` and a long local-storage explanation. Privacy is a product strength, but the Home screen should first answer the user's immediate question: **Where am I in my cycle, and when is my next period likely?**

**V2 action:** move privacy into a compact trust indicator / Settings section. Home should lead with cycle status and prediction.

### 2. Prediction is important but visually shares equal weight with secondary content

The prediction card is already correct in principle and transparent, but the hierarchy can be stronger.

**V2 action:** create one dominant `Next period` module with:
- expected date
- prediction window
- confidence
- cycles used / data basis
- a short, plain-language explanation

### 3. Logging requires too many concepts at once

The current modal presents date, flow, mood, symptoms, and notes together. This is complete but not optimal for a daily habit.

**V2 action:** make flow the primary decision, with mood/symptoms/notes clearly secondary. Keep the full editor available without making it feel mandatory.

### 4. Calendar contains useful information but too many visual states compete

Logged period days, predicted days, other logs, and today are all represented. The calendar should make these states understandable in seconds on a phone.

**V2 action:** simplify the visual language and add a selected-day summary rather than requiring users to infer everything from the grid.

### 5. History is accurate but reads like an internal report

The current History view exposes averages, ranges, raw cycle records, symptom frequency, and mood frequency. It is factually useful but not yet product-oriented.

**V2 action:** prioritize:
1. recent cycles,
2. typical cycle length,
3. consistency/range,
4. period duration,
5. optional symptom/mood patterns.

### 6. Settings exposes implementation details

`localStorage`, infrastructure terminology, and baseline configuration are more technical than necessary for the end user.

**V2 action:** Settings should become:
- Data & Privacy
- Prediction baseline
- Backup & Restore
- Delete all data

## Proposed V2 information architecture

### Home

1. **Cycle status** — current cycle day / last period start
2. **Next period** — primary prediction card
3. **Quick log** — one-tap logging for today
4. **Today** — compact recorded summary
5. Optional: small data-quality note when prediction confidence is low

### Calendar

1. Month navigation
2. Clear cycle/period visualization
3. Prediction window
4. Tap a day → focused day editor/summary
5. Today shortcut

### History

1. Recent cycle timeline
2. Typical cycle length + observed range
3. Average period length
4. Data consistency / number of cycles
5. Symptom and mood patterns as secondary sections

### Settings

1. Privacy & local data
2. Prediction baseline (only relevant before enough history exists)
3. Backup / restore
4. CSV export
5. Delete all data

## Product language rules

Use:
- `Estimated next period`
- `Prediction window`
- `Based on 4 recent cycles`
- `Low / Moderate / High confidence`
- `Your data stays on this device`

Avoid:
- medical certainty
- diagnostic language
- excessive engineering terminology
- repeated `No AI / No Cloud / No Ads` messaging
- implying that prediction is medically accurate

## Mobile-first rules

- Primary actions must be reachable with one hand.
- The Home screen should communicate its main result without scrolling on common phone sizes where practical.
- Logging flow should minimize typing.
- Calendar cells must remain legible at small widths.
- Destructive actions require explicit confirmation.

## Phase 2 implementation sequence

### Phase 2B — Core logging UX

Rebuild the logging interaction around fast flow logging while retaining optional mood/symptoms/notes.

### Phase 2C — Home hierarchy

Make cycle status + next-period prediction the dominant experience.

### Phase 2D — Calendar and History

Simplify visual states and improve scanability of historical patterns.

### Phase 2E — Settings / Data trust

Refine backup, restore, privacy, baseline settings, and destructive actions.

### Phase 2F — Product polish

Responsive QA, accessibility pass, empty states, microcopy, loading/error states, and visual consistency.

## Explicit non-goals

- Reintroducing Gemini or another AI provider.
- Adding accounts or cloud synchronization.
- Adding social/community functionality.
- Adding complex medical/health claims.
- Adding features merely to increase feature count.

## Phase 2A exit criteria

Phase 2A is complete when implementation follows this audit and every new feature can answer: **does this materially improve logging, prediction, understanding, or data control?**

The next implementation checkpoint is **Phase 2B — Core Logging UX**.
