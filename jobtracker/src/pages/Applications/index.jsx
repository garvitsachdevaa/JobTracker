import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { FiBookmark, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState/EmptyState'
import Filters from '../../components/Filters/Filters'
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard'
import SearchBar from '../../components/SearchBar/SearchBar'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import useApplications from '../../hooks/useApplications'
import useDebounce from '../../hooks/useDebounce'
import { ROUTES } from '../../utils/constants'

function formatAppliedDate(appliedDate) {
  if (!appliedDate) {
    return '--'
  }

  const parsedDate = new Date(appliedDate)

  if (Number.isNaN(parsedDate.getTime())) {
    return '--'
  }

  return format(parsedDate, 'dd MMM yyyy')
}

function formatSalary(application) {
  const salary = Number(application.salary || 0)
  const salaryMax = Number(application.salaryMax || 0)

  if (!salary) {
    return '--'
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: application.currency || 'USD',
    maximumFractionDigits: 0,
  })

  if (salaryMax > salary) {
    return `${formatter.format(salary)} - ${formatter.format(salaryMax)}`
  }

  return formatter.format(salary)
}

function guessDomain(company) {
  const normalized = String(company || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')

  if (!normalized) {
    return 'company.com'
  }

  return `${normalized}.com`
}

function CompanyIdentity({ company }) {
  const [logoError, setLogoError] = useState(false)
  const safeCompany = company || 'Unknown Company'
  const initials = safeCompany
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {logoError ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {initials || 'NA'}
        </div>
      ) : (
        <img
          alt={`${safeCompany} logo`}
          className="h-9 w-9 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          loading="lazy"
          onError={() => setLogoError(true)}
          src={`https://logo.clearbit.com/${guessDomain(safeCompany)}`}
        />
      )}
      <span className="font-medium text-slate-900 dark:text-slate-100">{safeCompany}</span>
    </div>
  )
}

function emptyStateAction() {
  return (
    <Link
      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
      to={ROUTES.addApplication}
    >
      Add Application
    </Link>
  )
}

export default function ApplicationsPage() {
  const {
    applications,
    update,
    delete: deleteApplication,
    toggleBookmark,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
  } = useApplications()

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const filteredApplications = useMemo(() => {
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase()

    const filtered = applications.filter((application) => {
      const matchesQuery =
        !normalizedQuery ||
        application.company.toLowerCase().includes(normalizedQuery) ||
        application.role.toLowerCase().includes(normalizedQuery)

      const matchesStatus = !filters.status || application.status === filters.status
      const matchesPlatform = !filters.platform || application.platform === filters.platform
      const matchesLocationType = !filters.locationType || application.locationType === filters.locationType

      return matchesQuery && matchesStatus && matchesPlatform && matchesLocationType
    })

    const sorted = [...filtered]

    if (sortBy === 'company') {
      sorted.sort((leftApplication, rightApplication) =>
        leftApplication.company.localeCompare(rightApplication.company),
      )
      return sorted
    }

    if (sortBy === 'salary-asc') {
      sorted.sort(
        (leftApplication, rightApplication) =>
          Number(leftApplication.salary || 0) - Number(rightApplication.salary || 0),
      )
      return sorted
    }

    if (sortBy === 'salary-desc') {
      sorted.sort(
        (leftApplication, rightApplication) =>
          Number(rightApplication.salary || 0) - Number(leftApplication.salary || 0),
      )
      return sorted
    }

    sorted.sort(
      (leftApplication, rightApplication) =>
        new Date(rightApplication.appliedDate).getTime() - new Date(leftApplication.appliedDate).getTime(),
    )

    return sorted
  }, [applications, debouncedSearchQuery, filters.locationType, filters.platform, filters.status, sortBy])

  const hasAnyApplications = applications.length > 0
  const hasVisibleApplications = filteredApplications.length > 0

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Applications</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Application Board
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track your applications with search, filters, sorting, and quick actions.
          </p>
        </div>

        <Link
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
          to={ROUTES.addApplication}
        >
          + Add Application
        </Link>
      </header>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <SearchBar onChange={setSearchQuery} value={searchQuery} />
        <Filters
          activeTab={activeTab}
          filters={filters}
          onActiveTabChange={setActiveTab}
          onFilterChange={(key, value) => setFilters({ [key]: value })}
          onSortByChange={setSortBy}
          sortBy={sortBy}
        />
      </div>

      {!hasAnyApplications ? (
        <EmptyState
          action={emptyStateAction()}
          description="Add your first application to start tracking interviews, offers, and follow-ups."
          title="No applications yet"
        />
      ) : null}

      {hasAnyApplications && !hasVisibleApplications ? (
        <EmptyState
          description="Try changing search text, filters, or sorting options to find matching applications."
          title="No matching applications"
        />
      ) : null}

      {hasVisibleApplications && activeTab === 'kanban' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <KanbanBoard
            applications={filteredApplications}
            onStatusChange={(id, status) => update(id, { status })}
          />
        </div>
      ) : null}

      {hasVisibleApplications && activeTab === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Salary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Applied
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-slate-500" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                    <CompanyIdentity company={application.company} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-100">{application.role}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <div className="space-y-1">
                      <p>{application.location}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{application.locationType}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {formatSalary(application)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {formatAppliedDate(application.appliedDate)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        className={[
                          'rounded-lg border p-2 transition-colors duration-150',
                          application.bookmarked
                            ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500',
                        ].join(' ')}
                        onClick={() => toggleBookmark(application.id)}
                        type="button"
                      >
                        <FiBookmark className="h-4 w-4" />
                      </button>
                      <Link
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors duration-150 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                        to={`${ROUTES.applications}/${application.id}`}
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      <button
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors duration-150 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500/50 dark:hover:text-rose-300"
                        onClick={() => deleteApplication(application.id)}
                        type="button"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
