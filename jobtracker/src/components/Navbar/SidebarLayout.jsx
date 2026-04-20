import { FiBarChart2, FiBookmark, FiBriefcase, FiGrid, FiPlusCircle } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/applications', label: 'Applications', icon: FiBriefcase },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
]

const mobileLinks = primaryLinks.slice(0, 4)

function navClassName({ isActive }) {
  return [
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  ].join(' ')
}

function mobileNavClassName({ isActive }) {
  return [
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-150',
    isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-300',
  ].join(' ')
}

export default function SidebarLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Smart Job Tracker</p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Workspace</h1>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {primaryLinks.map((item) => {
            const Icon = item.icon

            return (
              <NavLink key={item.to} className={navClassName} to={item.to}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.to === '/applications' ? (
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    0
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        <NavLink
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
          to="/applications/new"
        >
          <FiPlusCircle className="h-4 w-4" />
          <span>Add New</span>
        </NavLink>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            JT
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100">Job Seeker</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Starter profile</p>
          </div>
        </div>
      </aside>

      <main className="pb-20 md:ml-60 md:pb-8">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {mobileLinks.map((item) => {
          const Icon = item.icon

          return (
            <NavLink key={item.to} className={mobileNavClassName} to={item.to}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}