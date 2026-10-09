# PRD — Ajay Singla Accounting Portfolio Website

## 1. Introduction
**Owner:** Ajay Singla — self-employed accountant, 15+ years' experience.
**Services:** GST return filing, Income Tax Return (ITR) filing, PAN card applications.
**Location:** One Way Traffic Road, Mansa, Punjab
**Phone:** 9988383380 | **Email:** ajay30@gmail.com

**Goal:** A premium, monochromatic, parallax portfolio website that builds trust with customers, recruiters and developers, captures enquiries through a contact form, and gives the owner an admin panel to read them. The system must be modular so features can be added later.

**Success metrics**
- Contact form submissions per month
- Visitor → enquiry conversion rate (GA4)
- Page load < 2.5 s on mobile (LCP)
- Lighthouse score ≥ 90 (Performance, SEO, Accessibility)

## 2. Audience
| Audience | What they want |
|---|---|
| Customers (individuals, shopkeepers, small businesses) | Services, trust, quick contact, location |
| Recruiters / firms | Experience, skills, credentials |
| Developers / collaborators | Clean professional presence, partnership contact |

## 3. Features
**MVP (must have)**
1. Pages: Home, About, Services (with sub-sections per service), Contact
2. Monochromatic parallax design, premium feel, responsive
3. Contact form → validated → stored in local SQL DB
4. Admin panel (login) → view, search, filter, mark read, export CSV of submissions
5. Google Analytics 4 (page views, form submit event, chatbot events, scroll depth)
6. Side chatbot widget (rule-based FAQ in MVP)
7. Owner information, contact details, embedded map link
8. SEO basics: meta tags, sitemap.xml, robots.txt, schema.org LocalBusiness

**Future (plug-in architecture)**
- Document checklist downloads (GST/ITR/PAN)
- Appointment booking, WhatsApp click-to-chat
- Blog / tax updates, testimonials CMS
- Email notification on new enquiry
- RAG-powered chatbot (see tech stack)
- Multi-language (English / Punjabi / Hindi)

## 4. Use Cases
| ID | Actor | Use case |
|---|---|---|
| UC1 | Customer | Browses services, understands what is needed for GST/ITR/PAN |
| UC2 | Customer | Submits enquiry through contact form |
| UC3 | Customer | Asks chatbot "What documents are needed for ITR?" |
| UC4 | Recruiter | Reads About page for experience |
| UC5 | Developer | Views site, contacts for collaboration |
| UC6 | Admin (Ajay) | Logs in, reviews and manages submissions |
| UC7 | Admin | Reviews GA4 dashboard for behaviour |

## 5. Tech Stack
### Chosen (MVP)
| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js (LTS)** | Single language for front and back end |
| Backend | Express.js | Simple, modular routers |
| Frontend | Server-rendered EJS templates + vanilla CSS/JS (Node-served) | Fast, SEO-friendly, no extra toolchain |
| Parallax | CSS `perspective`/`transform` + IntersectionObserver | No heavy library |
| Database | **SQLite (local SQL)** via `better-sqlite3` | Local, zero-config, file-based |
| Auth | express-session + bcrypt | Admin login |
| Security | helmet, express-rate-limit, csurf-style token, input validation (zod/validator) | Protect form and admin |
| Analytics | Google Analytics 4 (gtag.js) | Behaviour tracking |
| Config | `.env` + `config/features.js` flags | Easy add/remove features |

### Options evaluated (for future growth)
| Category | Options | Decision |
|---|---|---|
| SQL | SQLite (local), PostgreSQL, **Supabase** (hosted Postgres) | SQLite now; migrate to Postgres/Supabase via repository layer if hosted multi-user is needed |
| NoSQL | Firebase Firestore, MongoDB | Not needed — data is relational and small |
| Graph | Neo4j | Not needed now; only useful if modelling client–service–document relationships at scale |
| RAG / Vector | FAISS (local, in-process), Chroma (local server), Pinecone (managed), vectorless (keyword/BM25, FAQ JSON) | **MVP: vectorless** (FAQ JSON + keyword match). **Phase 2: Chroma or FAISS** over a knowledge base of tax FAQs |

The data layer is behind a repository interface (`db/repositories/*`) so the database can change without touching routes.

## 6. Non-functional Requirements
- Responsive (mobile first; most visitors in Punjab are on phones)
- Accessibility: WCAG AA contrast, `prefers-reduced-motion` disables parallax
- Security: hashed passwords, rate-limited form, sanitised output, HTTPS in production
- Privacy: cookie/consent notice for GA4; data kept only for enquiry handling
- Maintainability: modular folders, documented config

## 7. Assumptions & Notes
- Email is assumed to be **ajay30@gmail.com** (the "@" in the brief looks like a typo) — please confirm.
- Content must not promise guaranteed refunds/outcomes; add a disclaimer that services are professional assistance.
- Add credentials (e.g., registration/qualification numbers) only if the owner supplies them.
- Local SQLite works on a VPS or own machine; serverless hosts (Vercel etc.) have no persistent disk, so choose a VPS/Render with disk, or move to Postgres.

## 8. Out of Scope (MVP)
Online payments, client login portal, document upload.
