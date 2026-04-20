export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500 dark:border-slate-600 dark:border-t-indigo-300" />
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  )
}