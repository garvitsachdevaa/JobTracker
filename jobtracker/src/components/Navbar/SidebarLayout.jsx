import { useEffect, useMemo, useState } from 'react'
import { FiBarChart2, FiBookmark, FiBriefcase, FiGrid, FiMoon, FiPlusCircle, FiSun } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { useApplicationContext } from '../../context/ApplicationContext'

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/applications', label: 'Applications', icon: FiBriefcase },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
]

const mobileLinks = primaryLinks.slice(0, 4)
const THEME_STORAGE_KEY = 'jobtracker.theme'

function navClassName({ isActive }) {
  return [
    'group flex items-center justify-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-150 xl:justify-start',
    isActive
      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  ].join(' ')
}

function mobileNavClassName({ isActive }) {
  return [
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-150',
    isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-300',
  ].join(' ')
}

function ApplicationsCountBadge() {
  const { applications } = useApplicationContext()
  const applicationCount = useMemo(() => applications.length, [applications.length])

  return (
    <span className="ml-auto hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300 xl:inline-flex">
      {applicationCount}
    </span>
  )
}

export default function SidebarLayout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const ThemeIcon = theme === 'dark' ? FiSun : FiMoon

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-20 flex-col border-r border-slate-200 bg-white px-3 py-6 dark:border-slate-800 dark:bg-slate-900 md:flex xl:w-60 xl:px-4">
        <div>
          <div className="flex justify-center xl:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              JT
            </div>
          </div>
          <p className="hidden text-xs font-medium uppercase tracking-widest text-slate-400 xl:block">Smart Job Tracker</p>
          <h1 className="mt-2 hidden text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 xl:block">Workspace</h1>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {primaryLinks.map((item) => {
            const Icon = item.icon

            return (
              <NavLink key={item.to} className={navClassName} to={item.to}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
                {item.to === '/applications' ? <ApplicationsCountBadge /> : null}
              </NavLink>
            )
          })}
        </nav>

        <button
          aria-label="Toggle theme"
          className="mb-3 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 xl:justify-between"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <ThemeIcon className="h-4 w-4" />
            <span className="hidden xl:inline">Theme</span>
          </span>
          <span className="hidden text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 xl:inline">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <NavLink
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
          to="/applications/new"
        >
          <FiPlusCircle className="h-4 w-4" />
          <span className="hidden xl:inline">Add New</span>
        </NavLink>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700 xl:justify-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            JT
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100">Job Seeker</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Starter profile</p>
          </div>
        </div>
      </aside>

      <main className="pb-20 md:ml-20 md:pb-8 xl:ml-60">
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