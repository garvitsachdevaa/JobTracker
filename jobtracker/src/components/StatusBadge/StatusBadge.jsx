const statusStyles = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  Interviewing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  Ghosted: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
}

export default function StatusBadge({ status = 'Applied' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.Applied}`}>
      {status}
    </span>
  )
}