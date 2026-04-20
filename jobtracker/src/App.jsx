import { Navigate, Route, Routes } from 'react-router-dom'

function PlaceholderPage({ title }) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Smart Job Tracker</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Base React + Router + Tailwind setup is complete. Feature implementation starts in the next step.
        </p>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
      <Route path="/applications" element={<PlaceholderPage title="Applications" />} />
      <Route path="/applications/new" element={<PlaceholderPage title="Add Application" />} />
      <Route path="/applications/:id" element={<PlaceholderPage title="Edit Application" />} />
      <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
      <Route path="/bookmarks" element={<PlaceholderPage title="Bookmarks" />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}