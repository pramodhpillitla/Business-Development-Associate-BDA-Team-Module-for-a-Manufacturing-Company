<div align="center">
  <br />
  <h1>🚀 Enterprise BDA Pipeline & CRM</h1>
  <p>
    <strong>A high-performance, real-time Lead Management System built for Business Development Associates.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<br />

## 📖 Overview

This repository houses a production-grade Customer Relationship Management (CRM) tool specifically designed for Business Development teams. Rather than a standard CRUD application, this project is built on an **event-driven architecture** to solve real-world sales challenges like data staleness, pipeline bottlenecks, and lack of actionable insights.

It features a real-time collaborative Kanban pipeline, a heuristics-based AI insight engine, secure Role-Based Access Control (RBAC), and server-side aggregation for high-performance analytics.

## ✨ Key Features & Engineering Highlights

- ⚡ **Real-Time Pipeline Synchronization (Socket.IO):** 
  Integrated WebSockets to broadcast lead mutations across all active clients instantly. Prevents data collision when multiple sales reps modify the pipeline simultaneously.
- 🧠 **AI Deal Insights & Heuristics Engine:** 
  A backend rules-engine that scans the active pipeline to assign probability scores and surface actionable suggestions (e.g., flagging stagnant leads or identifying high-value "Whales"), rendering them on an intelligent dashboard.
- 📊 **Server-Side Filtering & Aggregation:** 
  Built optimized MongoDB Aggregation pipelines (`$match`, `$group`, `$avg`) to calculate conversion rates and revenue metrics at the database level. Includes debounced, server-side querying for Kanban filtering.
- 🛡️ **Role-Based Access Control (RBAC):** 
  Secure JWT authentication with explicit role definitions (`Admin` vs. `BDA`). Ensures sales reps can only edit their assigned leads while admins maintain global oversight.
- 📜 **Automated Audit Trails:** 
  The backend natively hooks into pipeline transitions to generate immutable, system-generated activity logs for full lifecycle accountability.
- 🎯 **Optimistic UI & Drag-and-Drop:** 
  Implemented `@dnd-kit` for a buttery-smooth, touch-compatible Kanban board with optimistic state updates for zero perceived latency.

## 📸 Screenshots

*(See the `/demo` folder for high-resolution captures of the system in action)*

<details>
  <summary><b>Click to expand UI Previews</b></summary>
  <br />
  <img src="demo/Screenshot%202026-05-24%20133740.png" width="800" alt="Dashboard View" />
  <br /><br />
  <img src="demo/Screenshot%202026-05-24%20133746.png" width="800" alt="Pipeline View" />
  <br /><br />
  <img src="demo/Screenshot%202026-05-24%20133759.png" width="800" alt="Lead Details" />
  <br /><br />
  <img src="demo/Screenshot%202026-05-24%20133809.png" width="800" alt="Analytics View" />
</details>

<br />

## 🏗️ System Architecture

### Database Schema Design (MongoDB + Mongoose)
- **Referential Integrity:** Utilized MongoDB `ObjectIds` to strictly bind `Leads`, `Users`, and `Activities`. 
- **Audit Separation:** Designed a separate `Activity` collection (1-to-Many with `Lead`) rather than embedding logs. This prevents core `Lead` documents from hitting MongoDB's 16MB document limit for long-running enterprise deals.

### REST API Structure
Strictly adhered to RESTful conventions for resource management:
- `GET /api/leads` - Fetches the pipeline (supports query params: `status`, `search`, `sortBy`)
- `PATCH /api/leads/:id/status` - Lightweight endpoint for drag-and-drop transitions
- `GET /api/metrics` - Triggers DB aggregations for the dashboard
- `GET /api/insights` - Invokes the AI heuristics engine

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Cluster (Local or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pramodhpillitla/Business-Development-Associate-BDA-Team-Module-for-a-Manufacturing-Company
   cd Business-Development-Associate-BDA-Team-Module-for-a-Manufacturing-Company
   ```

2. **Setup the Backend:**
   ```bash
   cd Backend
   npm install
   ```
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   ACCESS_TOKEN_SECRET=your_secret_key
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_secret
   REFRESH_TOKEN_EXPIRY=10d
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../Frontend
   npm install
   ```
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🤝 Contact

Developed by **[Your Name/Pramodh Pillitla]**.  
Feel free to reach out for a deeper technical walkthrough of the codebase!
