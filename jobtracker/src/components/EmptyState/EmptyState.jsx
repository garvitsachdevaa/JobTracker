export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      {icon ? <div className="mx-auto mb-3 inline-flex items-center justify-center text-slate-400 dark:text-slate-300">{icon}</div> : null}
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}