# Smart Job Tracker

Smart Job Tracker is a modern single-page web application for managing job applications from first submission to final outcome. It combines structured tracking, visual workflow management, and performance insights in one place.

## Overview
The application helps users:
- Capture each job application with complete context.
- Track progress through hiring stages.
- Manage follow-ups and interview timelines.
- Prioritize opportunities with bookmarks.
- Analyze trends using dashboard and analytics views.
- Export data for reporting or backup.

The app is built for fast daily usage and currently runs fully in the browser.

## Core Capabilities

### 1. Dashboard
Implemented in [src/pages/Dashboard/index.jsx](src/pages/Dashboard/index.jsx).

Key capabilities:
- Snapshot metrics: total applications, interviewing, offers, rejection rate, response rate.
- Follow-up reminders for upcoming due actions.
- Upcoming interviews panel with countdown labels.
- Recent activity feed (new and updated items).
- Visual charts for status distribution and monthly application volume.

### 2. Applications Workspace
Implemented in [src/pages/Applications/index.jsx](src/pages/Applications/index.jsx).

Key capabilities:
- Search by company or role.
- Filter by status, platform, and location type.
- Sort by applied date, salary, or company.
- Switch between table and Kanban views.
- Quick actions for bookmark, edit, and delete.
- CSV export for the application dataset.

### 3. Kanban Workflow Board
Implemented in [src/components/KanbanBoard/KanbanBoard.jsx](src/components/KanbanBoard/KanbanBoard.jsx).

Key capabilities:
- Drag-and-drop status transitions across workflow columns.
- Live card counts per status.
- Salary aggregation per column.
- Empty-column guidance states.

### 4. Add and Edit Application Flow
Implemented in:
- [src/pages/AddApplication/ApplicationForm.jsx](src/pages/AddApplication/ApplicationForm.jsx)
- [src/pages/AddApplication/index.jsx](src/pages/AddApplication/index.jsx)
- [src/pages/EditApplication/index.jsx](src/pages/EditApplication/index.jsx)

Key capabilities:
- Shared add/edit form experience.
- Validation using React Hook Form + Yup.
- Structured fields for salary, platform, dates, notes, and tags.
- Job Fit Score widget with matched and missing keyword hints.

### 5. Analytics
Implemented in [src/pages/Analytics/index.jsx](src/pages/Analytics/index.jsx).

Key capabilities:
- Conversion funnel view.
- Cumulative trend line (90-day window).
- Platform and location breakdowns.
- Salary range distribution analysis.
- Activity heatmap for application intensity over time.

### 6. Bookmarks
Implemented in [src/pages/Bookmarks/index.jsx](src/pages/Bookmarks/index.jsx).

Key capabilities:
- Dedicated list of saved opportunities.
- Fast remove bookmark action.
- Direct open to detailed edit route.

### 7. User Feedback and Celebration
Implemented in:
- [src/context/ApplicationContext.jsx](src/context/ApplicationContext.jsx)
- [src/components/ConfettiCelebration/ConfettiCelebration.jsx](src/components/ConfettiCelebration/ConfettiCelebration.jsx)
- [src/main.jsx](src/main.jsx)

Key capabilities:
- Toast feedback for create, update, delete, and bookmark operations.
- Confetti celebration when a role is moved to Offer.

## Data Source and Persistence

### Startup data behavior
On first run with an empty dataset:
1. The app attempts to fetch starter records from DummyJSON.
2. If the network call fails or times out, a local fallback starter dataset is used.
3. Seeded records are normalized and stored for future sessions.

Implementation reference: [src/services/api.js](src/services/api.js) and [src/context/ApplicationContext.jsx](src/context/ApplicationContext.jsx).

### Ongoing data behavior
- All user changes are persisted in browser localStorage.
- Data is rehydrated automatically on page reload.
- There is no server-side sync in the current version.

Persistence helper: [src/hooks/useLocalStorage.js](src/hooks/useLocalStorage.js).

## Product Workflow for End Users

### First-time usage
1. Open the app and allow initial starter data load.
2. Review the current pipeline from Dashboard and Applications.
3. Add or edit records to reflect real opportunities.

### Daily usage
1. Add new applications as they are submitted.
2. Update status after responses, interviews, and outcomes.
3. Use filters/search to focus on active priorities.
4. Use bookmarks for high-priority roles.
5. Export CSV when needed for reporting or sharing.

## How to Explain This App to Users

### 30-second product pitch
Smart Job Tracker is a personal command center for job hunting. It helps you organize applications, update progress in real time, monitor interview and follow-up timelines, and understand your pipeline performance through visual analytics.

### Suggested 2-3 minute demo script
1. Start on Dashboard and explain key metrics and reminders.
2. Move to Applications and show search, filters, sorting, and table/Kanban switching.
3. Open Add Application and highlight structured fields and fit scoring.
4. Drag one card in Kanban to demonstrate workflow updates.
5. Open Analytics to explain trends, funnel, and distribution insights.
6. Show Bookmarks and CSV export for practical daily usage.

## Technical Stack
- React 18 + Vite
- React Router DOM
- Tailwind CSS
- React Hook Form + Yup
- Recharts
- Framer Motion
- Axios
- Date-fns
- React Toastify

Full dependency list: [package.json](package.json).

## Known Constraints
- No authentication layer yet.
- No backend persistence yet.
- No multi-device sync in the current version.
- Company logo rendering depends on Clearbit domain inference and may not resolve for all company names.
- Job Fit Score is a heuristic scoring helper, not a predictive ML model.

## Local Development
From project root:

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Suggested Next Enhancements
1. Add authenticated user accounts.
2. Introduce backend storage and sync.
3. Add CSV import and migration tools.
4. Add automated tests for key business logic and form validation.
5. Extend notifications with calendar or email integrations.
