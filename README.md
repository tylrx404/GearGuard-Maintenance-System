# GearGuard

GearGuard is a full-stack maintenance management system built with Next.js and Tailwind CSS. It helps organizations manage equipment, coordinate maintenance teams, and handle repair requests through a role-based workflow.

## 🚀 Why GearGuard
Many organizations struggle to keep maintenance work organized when equipment data, repair requests, and team assignments are scattered across spreadsheets, chat messages, and email threads.

GearGuard solves this by providing:
- Centralized equipment tracking
- Role-based workflows for Employees and Maintenance Teams
- Kanban request management for corrective maintenance
- Calendar view for preventive maintenance
- Dynamic, interactive UI with real request flow

## 🌟 Key Features
- Equipment inventory and maintenance team management
- Employee role for creating and tracking requests
- Maintenance team role for scheduling, updating, completing, or scrapping requests
- Drag-and-drop Kanban board for request workflows
- Preventive maintenance calendar planning
- Scrap logic for unusable equipment
- Dashboard cards and charts for real-time status insights

## 🧱 Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- UI: Radix UI, DnD Kit, Recharts, Framer Motion
- Backend: Next.js API routes
- State: Zustand, React Hook Form, Zod
- Data model: In-memory mock store simulating a MongoDB-backed API

> Note: The current implementation uses in-memory API routes and mock store data. It is designed as a production-style app that can be extended with MongoDB or another database.

## 🧭 User Roles
- **Employee**: create equipment maintenance requests and monitor status
- **Maintenance Team**: manage ticket flow, schedule repairs, complete work, or scrap broken equipment

## 📁 Project Structure
- `app/` — Next.js pages, routes, and API endpoints
- `components/` — reusable UI components and feature widgets
- `lib/` — app state, mock data, models, and shared utilities
- `public/` — static assets
- `styles/` — global styling files

## 🛠️ Setup & Run Locally
1. Install dependencies
   ```bash
   pnpm install
   ```
2. Start the development server
   ```bash
   pnpm dev
   ```
3. Open your browser at `http://localhost:3000`

## 🔧 Available Scripts
- `pnpm dev` — start local development server
- `pnpm build` — build production app
- `pnpm start` — serve built app
- `pnpm lint` — run ESLint checks

## 💡 What Makes This Project Strong for GSSoC
- Real full-stack application using Next.js App Router
- Custom Kanban board with drag-and-drop support
- Role-based UI and request lifecycle management
- Clear maintenance and preventive planning workflows
- Clean component structure with reusable design system elements
- Production-ready architecture that can be extended with a real database

## 📌 Future Improvements
- Add MongoDB integration for persistent storage
- Implement authentication and role-based access control
- Add notifications and activity history
- Support bulk equipment import/export

## 📎 Credits
Built as a maintenance management demo with a focus on usability, workflow design, and enterprise-style functionality.

---

Thank you for checking out GearGuard. This repository is a strong showcase of end-to-end maintenance workflow design and modern React application architecture.
