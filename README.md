<div align="center">

![TeamBoard](./assets/banner.gif)

# TeamBoard

A Trello-lite task board with Organisations/Teams, **JWT authentication**, and a **secure refresh-token workflow**.  
This project is built to demonstrate practical backend patterns around **security, auth flows, and protected APIs**.

<!-- [Live Demo](https://your-demo-link.com) • [API Docs](https://your-docs-link.com) -->

</div>

---

## ✨ Features

### ✅ JWT + Refresh Token Workflow

I implemented a clean refresh-token flow that supports **silent re-authentication** for protected routes (e.g. `/me`) without forcing users to log in again.

![Refresh Token Flow](./assets/refresh_token_flow.png)

#### Advantages

- 🔒 **Short-lived access tokens** reduce the risk of token leakage
- 🍪 **Refresh token stored in HttpOnly cookie** (harder to steal via XSS)
- 🔁 **Silent refresh** improves UX (auto-renew access token when expired)
- 🧱 Clear separation of responsibility: access token = API access, refresh token = session continuation
- ✅ Works well with protected routes + automatic retry on `401 Unauthorized`

#### Current endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /me` (protected)

#### Upcoming features

- 🏢 Organisations + Teams CRUD
- ✅ Task CRUD (create/update/delete)
- 👤 Single assignee per task
- 🔐 Role-based access control (Owner/Admin/Member)
- 🧪 Test suite (unit + integration)
- 📄 API docs (Swagger/OpenAPI)
- 🚦 Rate limiting + brute-force protection for auth routes

---

## 🧱 Tech Stack

- Node.js, Express
- PostgreSQL (or MongoDB)
- JWT (access + refresh tokens)

---

## 🚀 Getting Started

### 1) Install

```bash
npm install
```
