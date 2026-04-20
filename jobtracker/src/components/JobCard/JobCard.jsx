import { memo } from 'react'

function JobCard({ children }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {children}
    </article>
  )
}

export default memo(JobCard)