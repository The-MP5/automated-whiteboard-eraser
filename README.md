# 🤖 Smart Board Buddy — Automated Whiteboard Eraser (ROS simulation)

Senior Capstone (**Group 21**): Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta.

---

## Project Overview

**Smart Board Buddy** simulates an automated classroom whiteboard eraser: full or partial erase, safety behavior, and digital archiving—before deploying to physical hardware (ROS / Kinova).

This repo is the **React simulation UI** used to validate logic, timing, and constraints against product requirements.

---

## 📚 Documentation

**Architecture, technical debt, and backlog-ready notes** live in [`docs/`](./docs/). Start here:

| Document | Description |
|:---|:---|
| **[Project reset & architecture baseline](./docs/PROJECT_RESET_REPORT.md)** | Lab 1 — system diagram, component map, backlog health |
| **[Risk & technical debt inventory](./docs/DEBT_AND_RISK.md)** | Debt items, AI risks, acceptance criteria for GitHub issues |
| **[Lab 4 agent sprint plan](./docs/LAB4_AGENT_SPRINT_PLAN.md)** | Raw agent output + human revisions + final scoped sprint plan |
| **[Lab 5 sprint execution summary](./docs/LAB5_SPRINT_EXECUTION_SUMMARY.md)** | Completed vs incomplete sprint items, AI usage, collaboration, and board hygiene evidence |
| **[Lab 5 RTM update](./docs/RTM_LAB5_UPDATE.md)** | Requirement/debt traceability from board items to PR evidence and sprint status |
| **[Architecture diagram (SVG)](./docs/architecture-diagram.svg)** | Visual used in the project reset report |
| **[VIBE refactor (assignment)](./docs/VIBE_REFACTOR_ASSIGNMENT.md)** | Gatekeeper exercise: verification report + PR template |
| **[Senior Project II — agent workflow](./docs/SENIOR_PROJECT_II_AGENT_WORKFLOW.md)** | Backlog → plan → implement pattern for AI-assisted work |
| **[NFR4 — compatibility](./docs/NFR4_COMPATIBILITY.md)** | Browser / Node baseline (Subissue 4.4) |
| **[NFR4 — UAT checklist](./docs/NFR4_UAT_CHECKLIST.md)** | Manual two-browser smoke (Subissue 4.4) |

---

## ✨ Core requirements (interface)

| Area | What the UI demonstrates |
|------|---------------------------|
| **Erase control (FR2)** | One-touch full erase and partial erase via Fabric.js canvas |
| **Safety & pause (FR4, NFR3)** | Simulate obstacle — pauses when “object” is within 0.5 m |
| **Performance (NFR1)** | Erase timed toward a **10 s** target for a standard board |
| **Digital archiving (Story 7)** | Snapshot canvas state (persistence design in docs; see debt notes) |
| **Accessibility alert (Story 6)** | **10 s** countdown before erase starts |
| **Compatibility (NFR4)** | Runs on **last 2** major Chrome / Edge / Firefox / Safari; **Node 20–22 LTS** for dev/build — see [`docs/NFR4_COMPATIBILITY.md`](./docs/NFR4_COMPATIBILITY.md) |

---

## 🛠️ Technical Stack

| Layer | Choice |
|------|--------|
| **Frontend** | React + TypeScript (Vite) ⚛️ |
| **UI** | Tailwind CSS, shadcn/ui |
| **Canvas** | Fabric.js |
| **Build** | Vite (dev server port set in `vite.config.ts`, often **8080**) |
| **Backend (optional)** | Supabase client (`@supabase/supabase-js`) 🟢 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** **20.x or 22.x LTS** and **npm 10+** (see [`docs/NFR4_COMPATIBILITY.md`](./docs/NFR4_COMPATIBILITY.md) — **NFR4 / Subissue 4.4**)
- **Supabase** project credentials if you enable persistence (see below)

### Install

```bash
git clone https://github.com/The-MP5/automated-whiteboard-eraser.git
cd automated-whiteboard-eraser
npm install
```

### Supabase (optional for full persistence story)

Create a `.env` in the project root:

```env
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

The client reads **`VITE_SUPABASE_ANON_KEY`** (Supabase **anon public** key). For backward compatibility, **`VITE_SUPABASE_PUBLISHABLE_KEY`** with the same value is still accepted. Copy [`.env.example`](./.env.example) to `.env` and fill in values. Align table/schema with [`docs/DEBT_AND_RISK.md`](./docs/DEBT_AND_RISK.md) as the project wires up real persistence.

### Run the simulator

```bash
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:8080` if configured for port 8080).

---

## 🧪 Testing & Verification

The intended approach follows the course **Agile testing** model:

| Layer | Focus |
|--------|--------|
| **Unit** | Isolated logic (e.g. coordinates, simulation helpers) |
| **HIL** | Simulated ROS / control flow |
| **Integration** | UI → data layer → Supabase |
| **UAT** | Manual checks on usability and safety flows |
| **CI (NFR4)** | GitHub Actions **CI — build**: `npm ci` and `npm run build` on Node 20 and 22 ([`.github/workflows/ci-build.yml`](./.github/workflows/ci-build.yml)) |

For Subissue **4.4**, complete the **[UAT checklist](./docs/NFR4_UAT_CHECKLIST.md)** (two browsers) before closing the issue.

---

## 📄 License / Course

Capstone project — use and attribution per your institution’s policies.
