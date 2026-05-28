# ITRAANA ✨  
Timeless Attars · Pure Essence · Quiet Luxury

ITRAANA is a **full-stack luxury attar (perfume oil) e-commerce platform** inspired by India’s rich perfumery heritage and expressed through modern, minimal design.

The codebase is segregated into two independent tiers:
* `client/`: A Next.js 15 frontend application.
* `server/`: An Express.js + Mongoose + TypeScript backend application.

---

## 📸 Screenshots

> UI highlights from the ITRAANA platform

<img width="1872" height="900" alt="Screenshot 2026-01-11 144846" src="https://github.com/user-attachments/assets/48620b69-5c86-473b-af7c-e2d9a94f9fad" />

<img width="1885" height="896" alt="Screenshot 2026-01-11 144902" src="https://github.com/user-attachments/assets/a67a6148-8605-4512-8e71-14c6ffbf0278" />

<img width="1879" height="904" alt="Screenshot 2026-01-11 144923" src="https://github.com/user-attachments/assets/804ad969-5e43-4d7d-80fb-9b05930e2e3a" />

---

## 🌿 Brand Philosophy

> “Attars are not fragrances. They are memories distilled.”

ITRAANA represents restraint, patience, and quiet confidence.  
Every element — from product cards to typography — reflects **quiet luxury** rather than loud commerce.

---

## 🏗️ Architecture Layout

```
itraana/
├── client/                      # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                 # Pages & routing
│   │   ├── components/          # React components (CartDrawer, AuthDrawer, etc.)
│   │   ├── context/             # AuthContext and CartContext (State management)
│   │   └── api/axios.ts         # Axios client targeting backend port 5000
│   └── package.json
│
├── server/                      # Express TypeScript Backend
│   ├── src/
│   │   ├── config/db.ts         # Mongoose Atlas pooling
│   │   ├── controllers/         # Express controllers (req, res, next)
│   │   ├── services/            # Decoupled core services (inventory, order)
│   │   ├── models/              # Mongoose Schemas (User, Product, Order)
│   │   ├── middleware/          # auth, rate-limiter, globalErrorHandler
│   │   └── server.ts            # App entry point
│   └── package.json
│
├── render.yaml                  # Blueprint for Render deployment
└── README.md                    # Project document
```

---

## 🚀 Local Development Setup

To run both services concurrently on your local machine, open two terminals.

### 1. Setup Backend Server (Port `5000`)
```bash
cd server
npm install
npm run dev
```
* **Seeding the Database**: To seed the 6 premium fragrances into your Atlas Database cluster, run:
  ```bash
  npm run seed
  ```

### 2. Setup Frontend Client (Port `3000`)
```bash
cd client
npm install
npm run dev
```

The frontend will load at [http://localhost:3000](http://localhost:3000) and automatically route its API requests to the Express server at [http://localhost:5000/api](http://localhost:5000/api).

---

## ☁️ Deployment on Render

This project includes a pre-configured `render.yaml` blueprint file for easy hosting on Render.

1. Create a new account on [Render](https://render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository containing this codebase.
4. Render will parse the `render.yaml` file and automatically instantiate:
   * **Backend service**: `itraana-backend` on Node.
   * **Frontend service**: `itraana-frontend` on Node.
5. In your Render Dashboard, you can edit the environment variables (`MONGO_URI`, `JWT_SECRET`) if you want to override the default credentials.
6. Once deployed, update the `NEXT_PUBLIC_API_URL` environment variable on your frontend service to point to your live Render backend URL (`https://your-backend-app.onrender.com/api`).
