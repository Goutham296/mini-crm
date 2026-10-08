# Mini CRM API

Base URL: `${VITE_API_URL}/api`. Every request from the frontend must send credentials (`fetch(..., { credentials: 'include' })` / axios `withCredentials: true`).

- **Auth:** JWT in an `httpOnly` cookie named `token` (7 days). `Secure; SameSite=None` in production, `SameSite=Lax` otherwise.
- **Errors:** always JSON `{ message, errors? }`. `400` validation (`errors: [{ path, message }]`), `401` not logged in, `403` blocked CORS origin, `404` not found / another user's record / malformed id, `409` duplicate email, `429` rate limited, `500` (no stack trace in production).
- **Ownership:** every record is scoped to the logged-in user; other users' records return `404`.
- **Lists:** paginated as `{ items, total, page, pages, limit }`. `page` defaults to 1, `limit` to 10 (max 100). Empty query values (`?status=`) are ignored.
- **`tzOffset`** (optional, on task endpoints, customer detail and dashboard): the browser's `new Date().getTimezoneOffset()` (India = `-330`). It decides what "today" means for due/overdue. Default `0` (UTC).
- Task `dueDate` is a calendar date (send `YYYY-MM-DD`); it is stored as UTC midnight.

## Health
| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ status: "ok" }` (no auth) |

## Auth
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` (8–72 chars, a letter and a number) | `201 { user }` + cookie. Rate limited (10/h per IP). `409` if email exists |
| POST | `/auth/login` | `{ email, password }` | `200 { user }` + cookie. `401` bad credentials. Rate limited (10/15 min) |
| POST | `/auth/logout` | – | `200`, clears cookie |
| GET | `/auth/me` | – | `200 { user }` or `401` (call on app load to restore the session) |
| POST | `/auth/forgot-password` | `{ email }` | Stub: always `200` with a generic message. Rate limited (5/h) |

`user` = `{ id, name, email, createdAt, updatedAt }`.

## Customers (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/customers` | Query: `search` (name/company/email, case-insensitive), `status` (`lead`\|`active`\|`inactive`), `sort` (`newest`\|`oldest`\|`name`), `page`, `limit` |
| POST | `/customers` | `{ name*, company, email, phone, status, notes }` → `201` |
| GET | `/customers/:id` | `{ customer, deals: Deal[], tasks: Task[] }` (nested data) |
| PATCH / PUT | `/customers/:id` | Any subset of the create fields |
| DELETE | `/customers/:id` | `204`. Also deletes the customer's deals and tasks |

## Deals (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/deals` | Query: `stage` (`lead`\|`qualified`\|`proposal`\|`won`\|`lost`), `customer` (id), `search` (title), `page`, `limit`. `customer` is populated `{ id, name, company, status }` |
| POST | `/deals` | `{ title*, value*, customer*, stage, expectedCloseDate }` → `201`. Customer must be the user's own (`400` otherwise) |
| GET | `/deals/:id` | Single deal |
| PATCH / PUT | `/deals/:id` | Any subset of the create fields (`expectedCloseDate: null` clears it) |
| PATCH | `/deals/:id/stage` | `{ stage }`. Used by the pipeline board. Sets `wonAt` when it becomes `won`, clears it otherwise |
| DELETE | `/deals/:id` | `204`. Linked tasks are kept but unlinked from the deal |

## Tasks (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/tasks` | Query: `status` (`open`\|`done`\|`overdue`\|`today`), `priority` (`low`\|`medium`\|`high`), `customer`, `deal`, `search` (title), `page`, `limit`, `tzOffset`. Sorted open first, then by due date |
| POST | `/tasks` | `{ title*, dueDate*, priority, done, customer, deal }` → `201`. Linking a deal also links its customer; a mismatched customer is `400` |
| GET | `/tasks/:id` | Single task |
| PATCH / PUT | `/tasks/:id` | Any subset of the create fields (`customer: null` / `deal: null` unlinks) |
| DELETE | `/tasks/:id` | `204` |

Every task includes a computed `overdue` boolean (`dueDate` before today and not done). It is never stored and can't be set by the client. `customer` and `deal` are populated (`{ id, name, company }`, `{ id, title, stage }`).

## Dashboard (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard` | Query: `tzOffset`. All numbers come from MongoDB aggregation scoped to the user |

```json
{
  "totalCustomers": 12,
  "openPipelineValue": 2425000,
  "openDeals": 9,
  "dealsWonThisMonth": { "count": 3, "value": 1360000 },
  "tasksDueToday": 3,
  "overdueTasks": 4,
  "pipelineByStage": [
    { "stage": "lead", "value": 565000, "count": 3 },
    { "stage": "qualified", "value": 580000, "count": 3 },
    { "stage": "proposal", "value": 1280000, "count": 3 },
    { "stage": "won", "value": 1570000, "count": 4 },
    { "stage": "lost", "value": 270000, "count": 2 }
  ]
}
```
Open pipeline = every stage except `won` and `lost`. "Won this month" uses `wonAt`.

## Environment variables
| Variable | Required | Example | Notes |
|---|---|---|---|
| `MONGO_URI` | yes | `mongodb+srv://…/minicrm` | Server won't start without it |
| `JWT_SECRET` | yes | 48+ random chars | Min 16 chars, no fallback |
| `CLIENT_URL` | yes | `https://mini-crm.vercel.app` | Comma-separated CORS allowlist, no trailing slash |
| `PORT` | no | `4000` | Render sets it |
| `NODE_ENV` | no | `production` | Must be `production` on the live server (secure cookies, no stack traces) |

## Scripts
`npm run dev` (tsx watch) · `npm run build` · `npm start` · `npm run seed` (demo user `demo@minicrm.test` / `Demo@1234`; resets only that user's data) · `npm test` · `npm run lint` · `npm run typecheck`

**Render:** Build command `npm ci --include=dev && npm run build` (TypeScript is a dev dependency and Render skips dev deps when `NODE_ENV=production`), start command `npm start`, health check path `/api/health`.
