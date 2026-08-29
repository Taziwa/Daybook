# Daybook

A small full-stack task manager. Create an account, log in, and manage a personal
to-do list that's saved in a real database. Built as a first "complete" full-stack
project — every piece a proper web app needs, nothing it doesn't.

**What it demonstrates:**
- A REST API (Node.js + Express) with real routes and controllers
- Authentication with hashed passwords (bcrypt) and JSON Web Tokens
- A database with an actual relationship (tasks belong to users)
- A frontend (plain HTML/CSS/JS) that talks to that API with `fetch`
- Deploying a split frontend + backend + database app entirely for free

## Stack

| Layer | Technology | Free host |
|---|---|---|
| Frontend | HTML, CSS, vanilla JavaScript | Netlify |
| Backend | Node.js, Express | Render |
| Database | MongoDB (via Mongoose) | MongoDB Atlas |
| Auth | JWT + bcrypt password hashing | — |

## Project structure

```
daybook/
├── backend/
│   ├── config/db.js            # connects to MongoDB
│   ├── models/                 # User.js, Task.js — the database schemas
│   ├── controllers/            # the actual logic for each route
│   ├── routes/                 # authRoutes.js, taskRoutes.js — the URLs
│   ├── middleware/              # authMiddleware.js (checks login), errorMiddleware.js
│   ├── server.js               # entry point — wires everything together
│   └── package.json
└── frontend/
    ├── index.html               # login page
    ├── register.html
    ├── dashboard.html            # the actual task list, once logged in
    ├── css/style.css
    └── js/                      # api.js, login.js, register.js, dashboard.js
```

---

## Part 1 — Run it on your own computer first

Get it working locally before you touch any hosting — it's much easier to debug
here than on a live server.

You'll need [Node.js](https://nodejs.org) installed (18 or newer).

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open the new `.env` file. You'll fill in `MONGO_URI` in Part 2 below — for now,
just set a `JWT_SECRET` (any long random string works; see the comment in the
file for a command that generates one).

Once you have a Mongo connection string (Part 2), start the API:

```bash
npm run dev
```

You should see `Server running on port 5000` and `MongoDB connected: ...`.
Visit `http://localhost:5000` in a browser — you should see a small JSON message
confirming the API is alive.

### Frontend

The frontend is plain HTML/CSS/JS, so it doesn't need `npm install` or a build
step. The easiest way to run it locally is the **Live Server** extension in
VS Code (right-click `index.html` → "Open with Live Server"), or:

```bash
cd frontend
npx serve .
```

Open the page it gives you, register an account, and try adding a task. If the
frontend can't reach the backend, double-check the backend is running and that
`API_BASE_URL` in `frontend/js/api.js` still points at `http://localhost:5000/api`
for local addresses (it does, by default).

---

## Part 2 — Put the database online: MongoDB Atlas (free)

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a new **Project**, then **Build a Database**.
3. Choose the **M0 Free** tier, pick any cloud provider and a region close to you, and create the cluster (this takes a few minutes).
4. Under **Security → Database Access**, add a database user with a username and password (autogenerate the password and save it somewhere — you'll need it in a moment).
5. Under **Security → Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). This is normal for this kind of small project — real access is still protected by the username and password.
6. Go back to your cluster, click **Connect → Drivers**, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Paste it into `backend/.env` as `MONGO_URI`, replacing `<username>` and `<password>` with your real values, and add a database name before the `?`, e.g. `.../daybook?retryWrites=true&w=majority`.

Restart `npm run dev` — the terminal should now log `MongoDB connected: ...`.

---

## Part 3 — Put the backend online: Render (free)

1. Push this project to a GitHub repository (both `backend/` and `frontend/` folders, in one repo, is fine).
2. Go to [render.com](https://render.com) and sign up (you can sign in with GitHub).
3. Click **New → Web Service**, and connect your GitHub repo.
4. Configure it:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Under **Environment Variables**, add:
   - `MONGO_URI` → your full Atlas connection string
   - `JWT_SECRET` → the same random string from your local `.env` (or a new one)
   - You don't need to set `PORT` — Render provides it automatically.
6. Click **Create Web Service**. The first deploy takes a few minutes. Once it's live, Render gives you a URL like `https://daybook-api.onrender.com`. Visit it — you should see the same JSON health-check message as locally.

**A note on Render's free tier:** the free instance "spins down" after about 15 minutes of no traffic, and takes 30–60 seconds to wake back up on the next request. That first request will feel slow — this is normal and expected on the free tier, not a bug. If it bothers you later, a free service like [cron-job.org](https://cron-job.org) can ping your API every 10 minutes to keep it warm.

---

## Part 4 — Put the frontend online: Netlify (free)

1. Before deploying, open `frontend/js/api.js` and replace the placeholder URL with your real Render URL from Part 3:
   ```js
   : 'https://YOUR-RENDER-APP-NAME.onrender.com/api';
   ```
2. Commit and push that change.
3. Go to [netlify.com](https://netlify.com) and sign up.
4. Click **Add new site → Import an existing project**, connect GitHub, and pick your repo.
5. Configure it:
   - **Base directory:** `frontend`
   - **Build command:** *(leave blank — there's nothing to build)*
   - **Publish directory:** `frontend`
6. Deploy. Netlify gives you a URL like `https://daybook-yourname.netlify.app`. Open it, register a new account, and add a task — it should save to your live database.

---

## How the pieces talk to each other

```
Browser (Netlify)  →  fetch() with a JWT  →  Express API (Render)  →  Mongoose  →  MongoDB Atlas
```

1. You register or log in → the backend hashes/checks your password and returns a signed JWT.
2. The frontend saves that token in `localStorage` and attaches it to every later request as an `Authorization: Bearer <token>` header.
3. The backend's `protect` middleware checks that header on every task route, so you only ever see your own tasks.

---

## Where to go from here

This is deliberately minimal so there's real room to practice. Good next steps, roughly easiest → hardest:

- Add a **due date** or **priority** field to tasks
- Add **categories/tags** and let users filter by them
- Add a **search box** that filters the visible task list
- Add **drag-and-drop reordering** (the [SortableJS](https://sortablejs.github.io/Sortable/) library is a light way in)
- Add a **dark mode** toggle (CSS variables already make this straightforward — swap the values in `:root`)
- Add **"forgot password"** (email a reset link — you'll need an email-sending service like Resend or SendGrid, both have free tiers)
- Rebuild the frontend in **React** once you're comfortable with the vanilla version — the API doesn't need to change at all
- Add automated tests for the API (Jest + Supertest is a common pairing)

## Troubleshooting

- **"Failed to fetch" in the browser console:** the backend probably isn't reachable — check the URL in `api.js`, and if it's freshly deployed on Render, remember the first request after inactivity can take up to a minute.
- **CORS error in the console:** make sure the backend is actually running and returning JSON (open the Render URL directly in a browser to check) — a crashed backend often shows up as a CORS error even though CORS isn't really the problem.
- **"MongoDB connected" never appears:** double check the password in your connection string doesn't contain characters like `@` or `/` without [URL-encoding them](https://www.mongodb.com/docs/manual/reference/connection-string/#special-characters-in-connection-strings) — or just regenerate a password without special characters in the Atlas dashboard.
- **Render deploy fails:** check the build logs on the Render dashboard — almost always either a missing environment variable or a typo in the root directory setting.
