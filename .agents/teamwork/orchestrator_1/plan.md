# Master Orchestration Plan: Ajay Singla Portfolio Website

## Objective
Deliver a production-ready portfolio website for Ajay Singla, a self-employed accountant with 15+ years of experience, covering Phases 1 to 5:
- Phase 1: Foundation (Node.js, Express, better-sqlite3, schema, seed)
- Phase 2: Design System (strictly monochrome tokens, Playfair Display + Inter, 4-pt grid, reduced motion)
- Phase 3: Public Pages (Home, About, Services, Contact with responsive shared navbar & footer)
- Phase 4: Contact Form Backend & Storage (validation, honeypot, rate limiting, hashed IP, SQLite storage)
- Phase 5: Admin Panel (bcrypt + express-session auth, lockout, 30m timeout, paginated submissions, search/filter, detail view, notes, CSV export, security helmet/CSRF/escaping)

## Orchestration Strategy: Project Pattern (Dual Track)
1. **Survey Phase (Phase 0)**:
   - Spawn 3 parallel investigators:
     - Explorer 1 (`survey_explorer_1`): Survey root workspace, files present, node environment, package.json if any.
     - Spec Miner 1 (`spec_miner_1`): Extract UI requirements, design tokens, typography, pages and content specifications from `docs/design.md`, `prd.md`, `phase.md`.
     - Spec Miner 2 (`spec_miner_2`): Extract architectural patterns, DB schemas, API endpoints, auth/session rules, security requirements from `architecture.md`, `memory.md`, `ORIGINAL_REQUEST.md`.
   - Synthesize findings into `PROJECT.md` with full Architecture, Feature Inventory, Milestones, and Interface Contracts.

2. **Dual-Track Execution**:
   - **Track A (E2E Testing Track)**:
     - Build independent opaque-box test runner & suites (Tiers 1-4).
     - Publish `TEST_READY.md`.
   - **Track B (Implementation Track)**:
     - Milestone 1: Scaffold & Foundation (Database, server, seed).
     - Milestone 2: Design System & Styling (CSS, design tokens, partials layout).
     - Milestone 3: Public Pages Implementation (EJS templates, controllers, routes).
     - Milestone 4: Contact Form Backend (Validation, CSRF, honeypot, rate-limit, DB insert).
     - Milestone 5: Admin Panel (Auth, sessions, submission management, CSV export).
     - Milestone 6: Final Milestone:
       - Phase 1: Run full E2E test suite against implementation until 100% pass.
       - Phase 2: Adversarial coverage hardening (Challengers + Worker + Reviewer + Auditor).

3. **Gate Criteria for Every Milestone**:
   - Build & tests pass.
   - All Reviewers APPROVE.
   - All Challengers confirm correctness.
   - Forensic Auditor reports CLEAN (Binary veto: Integrity violation = immediate failure).

4. **Fault Tolerance & Succession**:
   - Heartbeat cron every 10 min.
   - Track spawn counts (limit: 16 spawns before succession).
   - Permanent retirement of completed subagents.
