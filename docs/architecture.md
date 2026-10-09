# Architecture

## 1. 1D View — Layer Stack (one-dimensional)
```
Browser → Express routes → Controllers → Services → Repositories → SQLite
                                   ↘ Feature modules (chatbot, analytics)
```

## 2. 2D View — System Diagram
```mermaid
flowchart LR
  V[Visitor Browser] -->|HTTPS| E[Express Server - Node.js]
  A[Admin Browser] -->|HTTPS + session| E
  E --> R[Public Routes: Home About Services Contact]
  E --> AR[Admin Routes: login, submissions]
  E --> CB[Chatbot Module: /api/chat]
  R --> VW[EJS Views + static CSS/JS]
  R --> SV[Contact Service + validation]
  AR --> SV
  SV --> RP[Repository Layer]
  RP --> DB[(SQLite file)]
  CB --> KB[(FAQ JSON / future Chroma-FAISS)]
  V -.gtag events.-> GA[Google Analytics 4]
```

## 3. Folder Structure (modular & extendable)
```
portfolio/
├─ server.js
├─ .env
├─ config/        (index.js, features.js)
├─ db/            (schema.sql, connection.js, repositories/)
├─ modules/       (contact/, admin/, chatbot/, analytics/)   ← each feature = routes+controller+service
├─ views/         (layouts/, partials/, pages/, admin/)
├─ public/        (css/, js/, img/)
├─ middleware/    (auth.js, rateLimit.js, validate.js)
└─ docs/          (prd.md, architecture.md, design.md, phase.md, memory.md)
```
**Extension rule:** a new feature = a new folder in `modules/` + one line in `config/features.js` (`blog: true`).

## 4. ER Diagram
```mermaid
erDiagram
  ADMIN_USER ||--o{ SUBMISSION_NOTE : writes
  SUBMISSION ||--o{ SUBMISSION_NOTE : has
  SERVICE ||--o{ SUBMISSION : "enquired for"
  CHAT_SESSION ||--o{ CHAT_MESSAGE : contains

  ADMIN_USER {
    int id PK
    string username UK
    string password_hash
    datetime created_at
  }
  SERVICE {
    int id PK
    string slug UK
    string title
    string summary
    int sort_order
  }
  SUBMISSION {
    int id PK
    string name
    string email
    string phone
    int service_id FK
    string message
    string status "new|read|replied|archived"
    string ip_hash
    datetime created_at
  }
  SUBMISSION_NOTE {
    int id PK
    int submission_id FK
    int admin_id FK
    string note
    datetime created_at
  }
  CHAT_SESSION {
    int id PK
    string session_token
    datetime started_at
  }
  CHAT_MESSAGE {
    int id PK
    int session_id FK
    string role "user|bot"
    string text
    datetime created_at
  }
```

## 5. EER Diagram (with specialisation)
`PERSON` is generalised into admin and enquirer to allow future roles (staff, clients).
```mermaid
classDiagram
  class PERSON {
    +id PK
    +name
    +email
    +phone
  }
  class ADMIN_USER {
    +username
    +password_hash
    +role
  }
  class ENQUIRER {
    +first_contact_at
    +source
  }
  class FUTURE_CLIENT {
    +pan_ref
    +services_taken
  }
  PERSON <|-- ADMIN_USER : disjoint
  PERSON <|-- ENQUIRER : disjoint
  ENQUIRER <|-- FUTURE_CLIENT : "subclass (Phase 3)"
  ENQUIRER "1" --> "0..*" SUBMISSION : makes
  SERVICE "1" --> "0..*" SUBMISSION : concerns
```
MVP physically implements `SUBMISSION` and `ADMIN_USER` only; the EER is the extension plan. Disjoint, partial specialisation.

## 6. User Flows
### Visitor / customer
```mermaid
flowchart TD
  A[Land on Home] --> B{Intent}
  B -->|Learn| C[Services page] --> D[Contact CTA]
  B -->|Trust| E[About page] --> D
  B -->|Quick question| F[Chatbot] --> D
  D --> G[Fill form] --> H{Valid?}
  H -->|No| G
  H -->|Yes| I[Saved in DB] --> J[Thank-you message + GA event]
```
### Admin
```mermaid
flowchart TD
  L[/admin/login] --> M{Credentials ok?}
  M -->|No| L
  M -->|Yes| N[Dashboard: counts]
  N --> O[Submissions list: search, filter]
  O --> P[View detail] --> Q[Mark read/replied, add note, export CSV]
  N --> R[Logout]
```

## 7. Key API Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/`, `/about`, `/services`, `/contact` | Pages |
| POST | `/contact` | Submit enquiry |
| POST | `/api/chat` | Chatbot reply |
| GET/POST | `/admin/login`, `/admin/logout` | Auth |
| GET | `/admin/submissions` | List |
| GET/POST | `/admin/submissions/:id` | View / update status |
| GET | `/admin/submissions/export.csv` | Export |

## 8. Chatbot Design
- **MVP:** `faq.json` with intents/keywords → best match → answer, else fallback "Please leave your details" + link to form (vectorless).
- **Phase 2:** knowledge base chunks → embeddings → Chroma or FAISS → retrieve → LLM answer. Swappable behind `chatbot/engine.js`.

## 9. Security
helmet headers, rate limit on `/contact` and `/admin/login`, parameterised SQL, server-side validation, honeypot field, bcrypt, session cookie `httpOnly; secure; sameSite`, escape output.

## 10. Analytics Events (GA4)
`page_view`, `generate_lead` (form success), `chat_open`, `chat_message`, `click_call`, `click_email`, `scroll_depth`.
