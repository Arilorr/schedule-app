# erxes BalanceEd

Open-source EdTech plugin for the [erxes](https://github.com/erxes/erxes) platform that balances
student workload, lets parents verify weekly schedules, tracks academic progress, runs Gemma-powered
stress/schedule analytics, and matches students to volunteer & extracurricular opportunities that fit
their verified free time and "About Me" interests.

## Roles & workflows

| Role | What they can do |
| --- | --- |
| **Student** | Edit About Me (interests `#DigitalArt`, skills, career goals) · manage the weekly schedule (empty time is auto-marked 🟢 *Free Slot*) · check off assignments (completion % recomputes live) · browse AI-matched opportunities with Match Score + Mongolian reason |
| **Parent** | Review the weekly schedule and **Approve** it (any later schedule change invalidates the approval) · dashboard with live completion %, upcoming-exam alerts, weekly AI summary in Mongolian |
| **Teacher** | Post assignments/exams onto student calendars · class **Workload Index (1–10)** with per-student stress risk · AI recommendations to extend deadlines / adjust schedules when exams collide with heavy activity days · publish opportunities (skills, time slot, School/National/Global scope) |

## AI (Gemma)

- Workload score 1–10, status (`Balanced / Manageable / Busy / Overworked`), stress risk `Low/Medium/High`
- Schedule-conflict detection (exam/deadline on a ≥3h activity day) with Mongolian explanations
- Opportunity matching: `Match Score = 25 (free-slot fit) + 50·(skill overlap) + 25 (interest overlap)`,
  only opportunities that fit strictly inside verified free slots are shown
- Mongolian parent summaries and teacher recommendations

Set `GOOGLE_AI_API_KEY` (Google AI Studio) to route summaries/recommendations through Gemma
(`GEMMA_MODEL`, default `gemma-3-27b-it`). Without a key the plugin uses its built-in deterministic
analytics engine — identical output shape, so every feature works offline. The active backend is
shown in the UI (teacher view) and on `/health`.

## Accessibility

- High-contrast mode, colorblind-safe palette (every status also carries an icon: ✅ ⚠️ ),
  dyslexia-friendly font toggle
- 🎤 voice-input buttons (Web Speech API, `mn-MN`) on the About Me interests and schedule-activity
  fields, with a graceful placeholder message where unsupported

## Run it

```bash
npm install
cp .env.example .env      # optional: add GOOGLE_AI_API_KEY
npm run dev               # API http://localhost:3300/graphql · UI http://localhost:5173
npm run build && npm start  # production bundle served by the API server
```

Seeded demo data: two students (one overworked, one balanced), assignments/exams dated relative to
today, and six opportunities.

## GraphQL surface

Queries: `students`, `student`, `schedule` (stored + computed free slots), `freeSlots`,
`assignments`, `exams`, `opportunities`, `matchedOpportunities`, `workloadAnalysis`,
`classWorkload`, `aiBackend`.

Mutations: `updateAboutMe`, `addScheduleItem`, `removeScheduleItem`, `approveSchedule`,
`toggleAssignment`, `createAssignment`, `deleteAssignment`, `createExam`, `deleteExam`,
`createOpportunity`, `deleteOpportunity`.

`workloadAnalysis` returns exactly the analysis document from the spec
(`workloadAnalysis`, `academicProgress`, `matchedOpportunities`, `teacherRecommendations`,
`parentReport`).

## Layout

```
shared/types.ts        TypeScript interfaces from the spec (shared by UI + server)
server/db.ts           in-memory store + seed (swap point for mongoose in erxes)
server/schema.ts       GraphQL SDL
server/resolvers.ts    queries/mutations for all three roles
server/ai/gemma.ts     Google AI Studio client (Gemma), timeout + fallback
server/ai/analysis.ts  workload scoring, conflict detection, matching, Mongolian templates
src/                   React UI (role views, schedule grid, accessibility context)
```

## Deploying inside erxes

erxes plugins are npm packages that export GraphQL typeDefs/resolvers and mongoose models and are
mounted by the erxes API server. To deploy BalanceEd there:

1. Replace `server/db.ts` with mongoose models — each collection maps 1:1
   (`students → balanceed_students`, etc.); add `scopeBrandIds`/`createdAt` fields per erxes
   convention and a `connection.ts` using the plugin's mongo connection.
2. Move `server/schema.ts` + `server/resolvers.ts` into the plugin's `graphql/` folder; erxes merges
   them into the gateway schema. Wrap role checks with erxes permissions
   (`permissionRequired` / user-service lookups) so `parentVerification` mutations require the
   linked parent user and `createAssignment` requires a teacher.
3. Link identities: `StudentProfile.id` should reference the erxes user/contact id; the parent and
   teacher relations come from erxes user roles instead of the demo role switcher.
4. Keep `server/ai/*` unchanged — it is storage-agnostic.

The standalone mode in this repo exists so the plugin can be demoed and developed without a full
erxes installation.

## License

MIT
