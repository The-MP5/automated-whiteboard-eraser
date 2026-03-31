# 🤖 Smart Board Buddy — Automated Whiteboard Eraser (ROS simulation)

Senior Capstone (**Group 21**): Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta.

---

## Project Overview

**Smart Board Buddy** simulates an automated classroom whiteboard eraser: full or partial erase, safety behavior, and digital archiving—before deploying to physical hardware (ROS / Kinova).

This repo is the **React simulation UI** used to validate logic, timing, and constraints against product requirements.

---

## 📚 Documentation

**Architecture, technical debt, and backlog-ready notes** live in [`docs/`](./docs/). Start here:

| | |
|:---|:---|
| **[Project reset & architecture baseline](./docs/PROJECT_RESET_REPORT.md)** | Lab 1 — system diagram, component map, backlog health |
| **[Risk & technical debt inventory](./docs/DEBT_AND_RISK.md)** | Debt items, AI risks, acceptance criteria for GitHub issues |
| **[Lab 4 agent sprint plan](./docs/LAB4_AGENT_SPRINT_PLAN.md)** | Raw agent output + human revisions + final scoped sprint plan |
| **[Architecture diagram (SVG)](./docs/architecture-diagram.svg)** | Visual used in the project reset report |

---

## ✨ Core requirements (interface)

| Area | What the UI demonstrates |
|------|---------------------------|
| **Erase control (FR2)** | One-touch full erase and partial erase via Fabric.js canvas |
| **Safety & pause (FR4, NFR3)** | Simulate obstacle — pauses when “object” is within 0.5 m |
| **Performance (NFR1)** | Erase timed toward a **10 s** target for a standard board |
| **Digital archiving (Story 7)** | Snapshot canvas state (persistence design in docs; see debt notes) |
| **Accessibility alert (Story 6)** | **10 s** countdown before erase starts |

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

- **Node.js** (LTS) and **npm** (or yarn / bun)
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

Align table/schema and env var names with [`docs/DEBT_AND_RISK.md`](./docs/DEBT_AND_RISK.md) as the project wires up real persistence.

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

---

## 📄 License / Course

Capstone project — use and attribution per your institution’s policies.
