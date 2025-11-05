# Student Record Indexing System using B* Tree (React + Node.js)

A full-stack, real-time visualization app demonstrating a B* Tree index for student records with live metrics and animations.

## Stack
- Backend: Node.js, Express
- Frontend: React (Vite) + TailwindCSS
- Visualization: D3.js

## Monorepo Structure
```
bstar-tree-visualizer/
├── backend/
│   ├── index.js
│   ├── bstarTree.js
│   ├── records.json
│   ├── utils/timer.js
│   ├── package.json
│   ├── ENV_EXAMPLE.txt   # rename to .env locally if needed
│   └── render.yaml       # Render service config example
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── ENV_EXAMPLE.txt   # rename to .env locally if needed
    ├── vercel.json       # Vercel config
    └── src/
        ├── App.jsx
        ├── index.css
        ├── utils/api.js
        └── components/
            ├── TreeVisualizer.jsx
            ├── MetricsPanel.jsx
            ├── InsertForm.jsx
            ├── SearchForm.jsx
            ├── DeleteForm.jsx
            └── ResultCard.jsx
```

## Environment
- Backend `.env`:
```
PORT=4000
NODE_ENV=development
```
- Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:4000
```

## Quickstart

### 1) Backend
```bash
cd backend
# create .env per ENV_EXAMPLE.txt
npm install
npm run dev
```
API default on: http://localhost:4000

### 2) Frontend
```bash
cd ../frontend
# create .env per ENV_EXAMPLE.txt
npm install
npm run dev
```
App default on: http://localhost:5173

Ensure `VITE_API_BASE_URL` points to the backend base URL.

## API Contract
- POST `/api/insert` → returns tree + metrics + path
- GET `/api/search/:rollNo` → returns record, traversal path, metrics
- DELETE `/api/delete/:rollNo` → returns updated tree, metrics, path
- GET `/api/getTree` → returns tree + height + nodeCount + keyCount + complexity
- POST `/api/reset` → reset tree & records

## Deployment

### Backend → Render
- Use `backend/render.yaml` (or set up via dashboard):
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment: `NODE_ENV=production`
- Render provides `PORT`; no manual setting needed.

### Frontend → Vercel
- Project root: `frontend/`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL` → your Render backend URL

## Features
- B* Tree index (B-Tree with redistribution/merge) for roll numbers
- Live D3 visualization with path highlighting and split/merge updates
- Metrics: height, node count, key count, complexity log2(n), time (ms), comparisons
- UI: Insert, Search, Delete, Reset, Result panel
- Dark mode and soft UI polish

## Tests
- Backend tests (Jest) for insert/search/delete in `backend/tests/` (run: `npm test` in backend)
