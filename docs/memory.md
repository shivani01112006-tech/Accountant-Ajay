# Project Memory (for AI assistants)

> **Instructions to any AI working on this project:** Read this file first. Before ending a session, update "Current State", append to the Phase Log, and record new Decisions. Keep entries short and dated. Never store passwords or secrets here.

## Project Snapshot
- **Owner:** Ajay Singla — self-employed accountant, 15+ yrs; GST returns, ITR, PAN card applications
- **Contact on site:** ajay30@gmail.com (confirm), 9988383380, One Way Traffic Road, Mansa, Punjab
- **Goal:** Premium monochromatic parallax portfolio for customers, recruiters, developers
- **Pages:** Home, About, Services, Contact (+ Admin)
- **Stack:** Node.js (Express + EJS + vanilla CSS/JS), SQLite via better-sqlite3, GA4, rule-based chatbot (RAG later)
- **Docs:** prd.md, architecture.md, design.md, phase.md

## Current State
- **Active phase:** 9 - Deploy & Handover
- **Status:** All MVP features implemented (Phases 1-7). Website is fully functional with admin panel, contact form, analytics, and chatbot.
- **Next action:** Deploy to production. Review OWNER_GUIDE.md.

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-10-07 | Node.js only, server-rendered EJS | Owner requirement; simple & SEO friendly |
| 2026-10-07 | SQLite local DB | Owner asked for local SQL |
| 2026-10-07 | Data access via repository layer | Allows later move to Postgres/Supabase |
| 2026-10-07 | Chatbot MVP vectorless (FAQ JSON); RAG (Chroma/FAISS) in Phase 10 | Cost and simplicity |
| 2026-10-07 | Feature flags in `config/features.js`; features live in `modules/` | Owner wants easy extension |
| 2026-10-07 | Strictly monochrome palette | Premium look per owner |

## Open Questions
1. Confirm email: ajay30@gmail.com?
2. Photo, logo, qualifications/registration details to show?
3. Business hours and WhatsApp number (same as phone?)
4. Hosting choice (VPS with persistent disk recommended)
5. Languages needed (English / Hindi / Punjabi)?
6. GA4 Measurement ID

## Conventions
- Follow design.md tokens only; no ad-hoc colours
- New feature = new folder in `modules/` + flag in `config/features.js`
- All SQL parameterised; all input validated server-side
- Commit message format: `phase-N: short description`

## Phase Log
| Phase | Status | Date | Notes |
|---|---|---|---|
| 0 | Complete | 2026-10-07 | PRD, architecture, design, phase, memory files created |
| 1-5 | Complete | 2026-10-08 | Scaffold, pages, contact form, DB, admin panel implemented |
| 6-7 | Complete | 2026-10-09 | Chatbot widget and GA4/SEO schema added |
| 8 | Complete | 2026-10-09 | Backup script created. Ready for QA. |
| 9 | Pending | | Needs VPS deployment |

## Session Notes
(Append newest at top: date — what was done — what is next)
- 2026-10-07 — Created the five planning docs — next: gather content (Phase 0), then scaffold project (Phase 1)
