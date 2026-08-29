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

