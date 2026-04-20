import { format } from 'date-fns'
import { useState } from 'react'
import { FiBookmark } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'
import JobCard from './JobCard'
import StatusBadge from '../StatusBadge/StatusBadge'

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

export default function BookmarkCard({ application, onRemove }) {
  const [logoError, setLogoError] = useState(false)

  const safeCompany = application.company || 'Unknown Company'
  const initials = safeCompany
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <JobCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {logoError ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {initials || 'NA'}
            </div>
          ) : (
            <img
              alt={`${safeCompany} logo`}
              className="h-10 w-10 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              loading="lazy"
              onError={() => setLogoError(true)}
              src={`https://logo.clearbit.com/${guessDomain(safeCompany)}`}
            />
          )}

          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">{application.role}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{safeCompany}</p>
          </div>
        </div>

        <button
          aria-label={`Remove bookmark for ${safeCompany}`}
          className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-amber-600 transition-colors duration-150 hover:border-amber-400 hover:text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-300"
          onClick={() => onRemove(application.id)}
          type="button"
        >
          <FiBookmark className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</p>
          <div className="mt-1">
            <StatusBadge status={application.status} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Salary</p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{formatSalary(application)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Applied {formatAppliedDate(application.appliedDate)}</span>
        <Link
          className="font-medium text-indigo-600 transition-colors duration-150 hover:text-indigo-500 dark:text-indigo-300"
          to={`${ROUTES.applications}/${application.id}`}
        >
          Open
        </Link>
      </div>
    </JobCard>
  )
}