# Smart Job Tracker Dashboard — VSCode Agent Prompt

## Project Overview
Build a production-quality Smart Job Tracker Dashboard using React. This is a full SaaS-grade productivity application for job seekers. The UI is the primary differentiator — it must feel premium, modern, and polished (think Linear, Notion, or Vercel dashboard aesthetics). Every screen should feel intentional, not like a boilerplate CRUD app.

---

## Tech Stack (mandatory)

- React 18 with Vite
- React Router DOM v6
- Axios (for all API calls)
- React Hook Form + Yup (form handling and validation)
- Recharts (all analytics/charts — no other chart library)
- react-toastify (notifications)
- react-icons (icons throughout)
- date-fns (date formatting/manipulation)
- framer-motion (page transitions, card animations, micro-interactions)
- Tailwind CSS (utility-first styling — the entire UI must use Tailwind)

Install all of these upfront. Do not use any other styling approach.

---

## Folder Structure (strictly follow this)

src/
  components/
    Navbar/
    JobCard/
    Filters/
    SearchBar/
    Charts/
    KanbanBoard/         ← out-of-the-box feature
    StatusBadge/
    EmptyState/
    ConfettiCelebration/ ← out-of-the-box feature
  pages/
    Dashboard/
    Applications/
    AddApplication/
    EditApplication/
    Analytics/
    Bookmarks/
  context/
    ApplicationContext.jsx
  hooks/
    useApplications.js
    useDebounce.js
    useLocalStorage.js
    useJobFitScore.js    ← out-of-the-box feature
  services/
    api.js
  utils/
    helpers.js
    constants.js

---

## Data Model

Each application object:
{
  id: string (uuid),
  company: string,
  role: string,
  location: string,
  locationType: "Remote" | "Hybrid" | "On-site",
  salary: number,
  salaryMax: number,
  currency: "USD" | "INR" | "EUR" | "GBP",
  platform: "LinkedIn" | "Naukri" | "Company Website" | "Referral" | "AngelList" | "Other",
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Ghosted",
  appliedDate: ISO date string,
  interviewDate: ISO date string | null,
  notes: string,
  bookmarked: boolean,
  tags: string[],           ← out-of-the-box feature
  fitScore: number (0-100), ← out-of-the-box feature
  followUpDate: ISO date string | null,
  resumeVersion: string,
}

---

## State Management — Context API

Create ApplicationContext with:
- applications: array
- addApplication(data)
- updateApplication(id, data)
- deleteApplication(id)
- toggleBookmark(id)
- filters: { status, platform, locationType }
- setFilters(filters)
- sortBy: "appliedDate" | "salary" | "company"
- setSortBy(val)
- searchQuery: string
- setSearchQuery(val)
- activeTab: string
- setActiveTab(tab)

Wrap the entire app in <ApplicationProvider>. Persist applications to localStorage via useLocalStorage hook.

---

## Routes (React Router DOM v6)

/dashboard            → Dashboard page
/applications         → Applications list (table + kanban toggle)
/applications/new     → Add application form
/applications/:id     → Edit application form
/analytics            → Charts and stats
/bookmarks            → Bookmarked jobs

---

## Pages

### 1. Dashboard (/dashboard)

Top row — 5 stat cards with animated counters (framer-motion):
  - Total Applications
  - Interviewing
  - Offers Received
  - Rejection Rate (percentage, shown as circular progress)
  - Response Rate (heard back / total applied)

Middle row — 2 charts side by side:
  - Recharts PieChart: application status distribution (Applied/Interviewing/Offer/Rejected/Ghosted)
  - Recharts BarChart: applications per month (last 6 months)

Bottom row:
  - "Upcoming Interviews" panel: chronological list of jobs with interviewDate in the next 14 days, with a countdown badge ("in 2 days", "Tomorrow", "Today!")
  - "Recent Activity" feed: last 5 added/updated jobs as a timeline list

### 2. Applications Page (/applications)

Two view modes (toggle in top bar):
  - Table view: company logo + name, role, location, status badge, salary, applied date, actions
  - Kanban view (out-of-the-box): drag-and-drop cards across columns (Applied → Interviewing → Offer → Rejected). Dragging a card updates its status automatically. Use framer-motion for smooth drag.

Top bar controls:
  - SearchBar (debounced 500ms, searches company + role)
  - Filter dropdowns: Status, Platform, Location Type
  - Sort selector: Applied Date, Salary (asc/desc), Company Name
  - View toggle (table / kanban icon buttons)
  - "+ Add Application" button (right-aligned, primary CTA)

Status badges must be colored:
  - Applied → blue
  - Interviewing → amber
  - Offer → green (trigger confetti on status change to Offer)
  - Rejected → red
  - Ghosted → gray

Handle empty state with a custom EmptyState component (illustration + message + CTA).

Company logos: https://logo.clearbit.com/{domain} — derive domain from company name when possible. Fallback to a colored avatar using company initials.

### 3. Add / Edit Application (/applications/new and /applications/:id)

Two-column layout on desktop, single column on mobile.

Form fields with react-hook-form + yup:
  - Company Name (required)
  - Job Role (required)
  - Location (text)
  - Location Type (Remote / Hybrid / On-site) — toggle pill buttons, not a dropdown
  - Salary Range (min + max side by side, with currency selector)
  - Platform (select)
  - Status (select with colored indicators)
  - Applied Date (required, date picker)
  - Interview Date (conditional: show only if status is Interviewing or beyond)
  - Follow-up Date (date picker)
  - Resume Version (text, e.g. "v3-senior-fe")
  - Tags (comma-separated, rendered as removable pills)
  - Notes (textarea)

Job Fit Score widget (out-of-the-box):
  - Below the form, show a "Job Fit Score" panel
  - User pastes a job description snippet into a textarea
  - useJobFitScore hook scores it client-side by counting keyword matches against the role, company, and notes fields
  - Display score as animated circular progress bar (0-100) with color gradient (red → yellow → green)
  - Show matched keywords highlighted below

Validation errors shown inline under each field. Toast on success/failure.

### 4. Analytics (/analytics)

Full analytics page with Recharts only:

Row 1:
  - Recharts RadialBarChart: offer conversion funnel (Applied → Interviewing → Offer)
  - Recharts LineChart: cumulative applications over time (daily, last 90 days)

Row 2:
  - Recharts BarChart: applications by platform (LinkedIn, Naukri, etc.)
  - Recharts PieChart: location type breakdown (Remote / Hybrid / On-site)

Row 3 (out-of-the-box):
  - Application Heatmap: a GitHub-style contribution calendar showing application activity by day. Build this as a custom SVG grid component using date-fns. 7 rows (days of week) × 13 columns (weeks). Color intensity = number of apps on that day.
  - Salary Range Distribution: Recharts AreaChart showing salary ranges across all applications

Key stats summary row at top:
  - Average time between apply and interview (in days)
  - Most active platform
  - Best response rate month

### 5. Bookmarks (/bookmarks)

Grid of BookmarkCard components for all bookmarked jobs.
Each card shows: company logo, role, company, status badge, salary, applied date, and a "Remove Bookmark" icon.
Empty state if no bookmarks.

---

## Out-of-the-Box Features

### 1. Kanban Board with Drag-and-Drop
Implement a kanban board view on the Applications page. Each column = a status. Cards are draggable across columns using framer-motion's drag constraints and layout animations. Dropping a card on a column calls updateApplication() with the new status. Animate the card count badge on each column header when cards move.

### 2. Confetti Celebration
When a job's status is changed to "Offer", trigger a canvas-based confetti burst (build a lightweight confetti component using requestAnimationFrame — do not import a confetti library). Accompany it with a toast: "Congratulations! 🎉 You got an offer at [Company]!"

### 3. Job Fit Score
Client-side keyword scoring system in useJobFitScore hook. Takes a job description string and the application data. Extracts tech keywords, role keywords, and company context. Returns a score 0-100 and a list of matched/missing keywords. Displayed as an animated circular gauge on the Add/Edit form.

### 4. Application Activity Heatmap
GitHub-style contribution calendar built with custom SVG + date-fns. Shows application intensity per day over the past 3 months. Tooltip on hover showing date + count. Uses 5 shades of green (Tailwind green-100 to green-700).

### 5. Follow-Up Reminder System
On the Dashboard, if any application has a followUpDate within the next 3 days and is still in "Applied" status, show a highlighted reminder card at the very top: "You have [N] follow-ups due soon."

### 6. Ghosted Auto-Tagging (out-of-the-box logic)
In useApplications hook: if an application has been in "Applied" status for more than 21 days with no update, automatically suggest marking it as "Ghosted". Show a subtle banner in the application row: "No response in 21+ days — Mark as Ghosted?" with a one-click confirm button.

### 7. Export to CSV
On the Applications page, add an "Export CSV" button in the top bar. Use a helper in utils/helpers.js to convert the applications array to CSV and trigger a browser download. Include all fields.

---

## UI Design Guidelines (highest priority)

This is the primary differentiator. Every design decision should feel intentional and premium.

### Color Palette
Use Tailwind CSS. Primary accent: indigo-600. Success: emerald-500. Warning: amber-500. Danger: rose-500. Ghosted: slate-400.

Dark mode support is mandatory. Use Tailwind's dark: prefix throughout. The app should look equally polished in both modes.

### Typography
- Page headings: text-2xl font-semibold tracking-tight
- Section labels: text-xs font-medium uppercase tracking-widest text-slate-400
- Body: text-sm text-slate-600 dark:text-slate-300
- Monospace for IDs/dates where relevant: font-mono text-xs

### Layout & Spacing
- Sidebar navigation (not top navbar). Fixed left sidebar, 240px wide, collapsible on mobile.
- Content area has max-w-7xl mx-auto with generous px-6 py-8 padding.
- Cards use rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50.
- All interactive elements have smooth hover/focus transitions (transition-all duration-150).

### Animations (framer-motion)
- Page transitions: fade + slight upward translate (y: 8 → 0, opacity: 0 → 1, duration 0.25s)
- Stat cards: staggered entrance animation (each card delays 0.05s more than the previous)
- Job cards: scale on hover (scale: 1.01), spring transition
- Kanban cards: layout animation on drag/drop
- Number counters on dashboard stats: animate from 0 to value on mount

### Sidebar Navigation
Items: Dashboard, Applications, Analytics, Bookmarks, + Add New (CTA button at bottom).
Show application count badge next to "Applications".
Active route highlighted with indigo accent bar on left edge.
User avatar / initials at the bottom of sidebar.

### Responsive Design
- Mobile: sidebar collapses to bottom tab bar (4 main routes)
- Tablet: sidebar collapses to icon-only mode
- Desktop: full sidebar with labels

---

## APIs

### Mock job data (for initial seed)
GET https://dummyjson.com/products?limit=10
Map product data to job application shape for demo data on first load (only if localStorage is empty).

### Company Logos
https://logo.clearbit.com/{domain}
Derive domain by lowercasing company name + ".com" as a best guess.
Use <img onError> to fall back to a colored div with company initials.

---

## Custom Hooks

### useApplications
CRUD operations. Reads/writes to ApplicationContext. Methods: add, update, delete, toggleBookmark.

### useDebounce(value, delay)
Standard debounce. Used in SearchBar.

### useLocalStorage(key, initialValue)
Read/write to localStorage with JSON serialization. Used in ApplicationContext to persist data.

### useJobFitScore(jobDescription, applicationData)
Client-side keyword scoring. Returns { score: number, matched: string[], missing: string[] }.

---

## Performance Requirements
- Debounced search (500ms)
- Memoize filtered/sorted applications list with useMemo
- Use React.memo on JobCard and KanbanCard
- Lazy-load the Analytics page with React.lazy + Suspense
- Loading spinners on any async operations (axios calls)

---

## Error & Empty States
- Empty state component: accepts title, description, icon, and optional CTA button props
- Use it on: Applications (no apps yet), Bookmarks (no bookmarks), each Kanban column (0 cards), Analytics (no data)
- Toast notifications for all CRUD operations

---

## Validation (Yup schema)
const schema = yup.object({
  company: yup.string().required("Company name is required"),
  role: yup.string().required("Job role is required"),
  appliedDate: yup.date().required("Applied date is required"),
  salary: yup.number().positive().nullable(),
  salaryMax: yup.number().min(yup.ref("salary"), "Max must be ≥ min").nullable(),
  interviewDate: yup.date().nullable().min(yup.ref("appliedDate"), "Must be after applied date"),
})

---

## Deliverables Checklist

[ ] Vite + React project scaffolded with all npm packages installed
[ ] Tailwind CSS configured with dark mode (class strategy)
[ ] ApplicationContext with localStorage persistence
[ ] All 4 custom hooks implemented
[ ] React Router DOM routes configured
[ ] Sidebar layout component (collapsible, responsive)
[ ] Dashboard page with stat cards + charts + upcoming interviews
[ ] Applications page with table view + kanban view toggle
[ ] Add/Edit form with all fields, validation, fit score widget
[ ] Analytics page with all Recharts charts + heatmap
[ ] Bookmarks page
[ ] All 7 out-of-the-box features implemented
[ ] Framer-motion animations throughout
[ ] Dark mode support on every component
[ ] Responsive layout (mobile/tablet/desktop)
[ ] Empty states on all relevant views
[ ] Export to CSV working
[ ] Clearbit logo integration with initials fallback
[ ] react-toastify notifications on all mutations
[ ] Code split: Analytics page lazy loaded

---

## Important Notes for the Agent

1. Do not use any chart library other than Recharts.
2. All styling must be Tailwind CSS only — no inline style objects except where Tailwind cannot express it.
3. The UI quality is the evaluation priority. Invest heavily in spacing, typography, transitions, and component polish.
4. Use uuid or crypto.randomUUID() for generating application IDs.
5. Seed 8-10 realistic mock applications on first load (diverse companies, statuses, and dates) so the app looks populated immediately.
6. The Kanban board columns should show a count badge and a subtle aggregate "total salary range" below the column header.
7. All date displays must use date-fns format() — never raw JS Date strings.
8. The confetti component must be built from scratch with canvas + requestAnimationFrame. Do not install a confetti npm package.
