export default function SearchBar({ value, onChange, placeholder = 'Search by company or role...' }) {
  return (
    <input
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  )
}