# PROJECT AUDIT — Full Stack Development Practicals

Project: Bhakti Ruparel portfolio + Task Manager (React/Vite frontend, Node/Express/MongoDB backend)
Audit stage: **Stage 1 (inspection only). No source file was modified.**

## How this audit was done

| Check | Result |
|---|---|
| Every frontend file in `src/` that carries logic was read (App, main, api.js, Navbar, Hero, About, Skills, Projects, Contact, Footer, TodoPage, TasksPage, GithubRepos, LoginPage, RegisterPage) | Done |
| Every backend file was read (server.js, routes, middleware, models, package.json, .env.example, README) | Done |
| Existing docs read (`README.md`, `docs/authentication.md`, `docs/practical-8-performance.md`, `backend/README.md`) | Done |
| `npm run build` (frontend) | **Passes** (54 modules, 246 kB main chunk, 7 lazy chunks) |
| `npm run lint` (oxlint) | 0 errors, 3 warnings (unused catch variables) |
| Backend started / API called / MongoDB connected | **NOT done.** There is no `backend/.env` (only `.env.example`), so the server cannot connect to a database yet. |
| Docker, GitHub Actions, tests | **None exist** |

Status words below mean: **Complete** = implemented and sound when read. **Partially Complete** = exists but has defects or gaps. **Missing** = not present.
"Complete" for backend items means *code-reviewed*, not *run*, until Stage 4/5 testing.

Git state: branch `main`, in sync with `origin/main`, working tree was clean before this file. Last commits: Portfolio Done, Practical 2, 3, 4, 5, 7, 8, "Login System enabled".

---

## Practical audit table

| # | Practical topic | Existing implementation | Status | What needs to be implemented or fixed |
|---|---|---|---|---|
| 1 | React intro & component architecture | Separate components (`Navbar`, `Hero`, `About`, `Skills`, `Projects`, `Contact`, `Footer`, `Spinner`, `ErrorMessage`), props, data arrays mapped to JSX, per-component CSS. | **Complete** | Minor: the GitHub SVG path is pasted in 4 files; `EditableTitle` is duplicated in `TodoPage` and `TasksPage`. Optional cleanup only. |
| 2 | State management & routing | `useState`/`useEffect`, lifted state in `App` (token, user, todo count), React Router v7 (`BrowserRouter`, `Routes`, `Navigate`), `ProtectedRoute` for `/tasks`. | **Partially Complete** | Navbar section links are plain `href="#about"`. On `/repos`, `/todo`, `/login` they do not go back to the home page, so they do nothing useful. `ProtectedRoute` only checks that a token exists, not that it is valid. |
| 3 | API integration & data rendering | `GithubRepos.jsx` fetches the GitHub API with loading spinner, error + retry, search filter, sorted cards. | **Complete** | None required. |
| 4 | RESTful API with Node + Express | `server.js`, `routes/taskRoutes.js` with GET/GET:id/POST/PUT/DELETE, `validateTask` middleware, ObjectId check, 400/404/201 codes, 404 handler, central error handler, CORS, JSON parsing. | **Partially Complete** | Route logic lives directly in route files (no controllers/services split). `PUT` passes `req.body` straight to Mongoose (accepts any field). `PUT` requires `title` even for a "toggle" call. CORS is open to every origin. Not run yet. |
| 5 | MongoDB + Mongoose schema design | `models/Task.js` (title, description, completed, createdAt) and `models/User.js` (hashed password, timestamps, unique email, reset-token fields). Atlas connection in `server.js`. | **Partially Complete** | **`Task` has no `dueDate` field, yet the frontend sends one, so due dates are silently dropped by Mongoose and lost on refresh.** `Task` has no owner (`user`) field. No indexes besides unique email. No `.env`, so DB connectivity is unverified. |
| 6 | Full-stack integration (React + Node + MongoDB) | `/tasks` page (`TasksPage.jsx`) calls the real API through `utils/api.js` for list/create/update/delete/toggle. Page header says "MongoDB Atlas Connected" (hard-coded text, not a real check). | **Partially Complete** | See "To-Do findings" below. Short version: `/todo` is localStorage only, `/tasks` is the database-backed one, and several bugs break it. API base URL is hard-coded to `http://localhost:5000`. |
| 7 | Authentication & middleware pipeline | Register, login, logout, `/me`, forgot/reset password, bcrypt (cost 10) via Mongoose pre-save hook, JWT (7d), `protect` middleware, `validateTask` middleware, generic login error message, hashed reset tokens with 30 min expiry, docs in `docs/authentication.md`. | **Partially Complete** | No authorization: every logged-in user sees and edits **every** task. A wrong password returns 401 and `apiFetch` treats any 401 as "session expired": it wipes the token and hard-redirects to `/login`, so the "Invalid email or password" message is lost. `/me` returns `{ user: {...} }` but `Navbar` and `TasksPage` read `data.email`, so the logged-in email is never shown. `JWT_EXPIRES_IN` is in `.env.example` but unused (hard-coded `7d`). Reset emails are only logged to the console (nodemailer not installed), and the reset link is also logged outside development. No rate limiting on login. |
| 8 | Performance optimisation & lazy loading | `React.lazy` + `Suspense` for 9 routes/components with a spinner fallback. Build confirms separate chunks. `docs/practical-8-performance.md` exists. | **Partially Complete** | No `React.memo`, `useMemo` or `useCallback` anywhere (searched). The doc still has `[Record from DevTools]`, `[Add screenshot here]` and Profiler placeholders. `TasksPage` receives a new inline `onCountChange={() => {}}` on each render. Home imports `Projects` lazily but renders it inside an eagerly rendered page, so that split gains little. |
| 9 | In-memory caching & query optimisation | Nothing. Only index is the unique `email` index. `Task.find({})` is unfiltered and unpaginated. | **Missing** | Add an in-memory cache with TTL and invalidation on write, indexes matching real queries, `.lean()` / projection, pagination. |
| 10 | Async processing / event-driven architecture | Nothing. No `EventEmitter`, queue or background job. | **Missing** | Add a real use of `EventEmitter` (for example: emit `task:created` / `user:registered`, with listeners that write an activity log and send the reset-email asynchronously). |
| 11 | Docker & Docker Compose | No Dockerfile, no compose file, no `.dockerignore`. | **Missing** | Frontend and backend Dockerfiles, `docker-compose.yml` with MongoDB + volume + healthchecks, root `.env.example`. |
| 12 | CI/CD with GitHub Actions | No `.github/` folder. | **Missing** | Workflow for install, lint, build, backend validation. The workflow file will be created but not triggered. |
| 13 | AI API integration | No AI code, no AI dependency, no key handling. | **Missing** | Backend-proxied portfolio assistant, optional (site must work with no key). |

### Skipped practicals
- **9, 10, 11, 12, 13 were never started.** There is no trace of them in the code or the commit history.
- Practical 6 has no commit of its own. Its work is partly inside Practical 7 ("protected CRUD" page), which is why it is only partly done.
- Practical 8 was started but its measurements and profiling were left as placeholders.

---

## To-Do findings (your suspicion was partly right)

There are **two** to-do implementations:

| Route | File | Storage | Needs login |
|---|---|---|---|
| `/todo` | `src/pages/TodoPage.jsx` | **Browser `localStorage` only.** No backend call at all. | No |
| `/tasks` | `src/pages/TasksPage.jsx` | **MongoDB via the Express API** | Yes |

So the database-backed to-do **does exist** at `/tasks`, and it persists across refresh once the backend and `.env` are set up. But:

1. **Due dates are lost.** The form sends `dueDate`; `Task.js` has no such field. Mongoose strict mode drops it.
2. **Tasks are shared by all users.** `Task` has no owner; `GET /tasks` returns all tasks to anyone logged in.
3. **Logged-in email never appears** (reads `data.email`, API returns `data.user.email`).
4. **Wrong-password login** is swallowed by the global 401 handler (see Practical 7).
5. **Description is never sent** by the UI, though the schema and API support it.
6. **Drag-and-drop reorder is client-side only**, so order resets on refresh.
7. The navbar badge on `/todo` counts localStorage tasks, while `/tasks` feeds a no-op. The two features are not connected, and there are two to-do pages in the navbar, which is confusing for an evaluator.
8. "MongoDB Atlas Connected" is static text, not a live status.

---

## Portfolio website audit

| Requirement | Present? | Notes |
|---|---|---|
| Landing page | Yes | `Hero` with photo (`src/assets/hero.png`), CTAs, social links. |
| About | Yes | Intro, education, experience. |
| Education & academic achievements | Partial | CHARUSAT 8.21 and Parul 9.67 are shown. Institute Topper and university gold medal are **not** shown. |
| Skills | Yes | 6 categories. |
| Projects | Partial | Only 2 projects (Industrial Knowledge AI, Unwire AI Insights). |
| Experience & internships | Partial | Only Sentiment AI. Hebbrix and AIESEC are absent. |
| Certifications & achievements | **Missing** | No section and no data in the project. |
| Contact section | Partial | Email/LinkedIn/GitHub links work, but **there is no contact form**. |
| Responsive navigation | Yes | Burger menu exists. Hash links break off the home page (see Practical 2). |
| Footer with social links | Yes | GitHub and LinkedIn only (no email). |

Content inconsistencies to resolve with you (I will not guess):
- Name is shown as "Ruparel Bhakti" in navbar, hero and footer, and as "Bhakti Ruparel" in the GitHub username and your earlier brief.
- Navbar logo is the text "RB".
- Skills/Projects/Contact mention **FastAPI, Supabase, LLM**. Your earlier description of Unwire AI lists Express, Prisma, PostgreSQL, TanStack Start. Tell me which is correct.
- The About text says "Built production-ready AI pipelines..." for Sentiment AI. I will leave existing wording unless you ask me to change it.

---

## Other findings

| Area | Finding |
|---|---|
| Deployment | No `vercel.json`. React Router deep links (`/tasks`, `/login`) will return 404 on Vercel refresh until a rewrite is added. `api.js` has `BASE_URL = 'http://localhost:5000'`, so production would call the visitor's own machine. |
| Backend hosting | `server.js` is a long-running Express server (`app.listen`). It does not fit Vercel serverless as written, so it needs a separate host (Render, Railway, etc.). |
| Security | CORS open to all origins. No `helmet`, no rate limit. Reset link logged outside development. `.env` is correctly git-ignored in `backend/.gitignore`. |
| Config | Root `.gitignore` does not list `.env`. Safe today because no root `.env` exists, but worth adding. |
| Tests | None. Backend has no `test` script. |
| Misc | Two root auth routers are mounted (`/api/auth` and `/`), which works but means every auth route is exposed twice. Frontend `package.json` name is still `react`. |

---

## Proposed order of work (matches your stages)

| Stage | Work |
|---|---|
| 3 | Fix navbar hash links, `apiFetch` 401 handling, `/me` response mismatch, API base URL via `VITE_API_URL`, add contact form + missing portfolio content (once you confirm facts). |
| 4 | Add `dueDate`, `user` owner, indexes to `Task`. Scope all task queries to the logged-in user. Whitelist fields on update. Decide what to do with the localStorage `/todo` page. |
| 5 | Auth hardening, `React.memo`/`useCallback`, in-memory cache, `EventEmitter` events. |
| 6 | AI assistant (backend proxy, optional). |
| 7 | Dockerfiles + compose, then test. |
| 8 | GitHub Actions file (not triggered). |
| 9 | `vercel.json`, env docs, backend hosting guide. |
| 10 | README, PRACTICALS_IMPLEMENTATION, DOCKER_GUIDE, DEPLOYMENT_GUIDE, API_DOCUMENTATION. |

## Things I need from you before or during later stages

1. A MongoDB connection string for local testing (Atlas free tier, or I use the Docker Mongo container in Stage 7). I will not create one for you.
2. Which tech stack is true for your projects (FastAPI/Supabase vs Express/Prisma/PostgreSQL).
3. Your preferred display name order, and whether to replace the "RB" logo text with your photo.
4. Facts for any new content: Hebbrix, AIESEC, certifications, gold medal and topper details.
5. Which AI provider you want, if any (Gemini has a free tier). The feature stays off without a key.
6. Whether `/todo` (localStorage) should be removed, kept as a demo, or merged into the database-backed page.
