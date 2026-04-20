import { motion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { FiMapPin } from 'react-icons/fi'
import StatusBadge from '../StatusBadge/StatusBadge'

const KANBAN_COLUMNS = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Ghosted']

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

function aggregateSalaryRange(cards) {
  const salaryCards = cards.filter((card) => Number(card.salary || 0) > 0)
  if (salaryCards.length === 0) {
    return '--'
  }

  const currencies = [...new Set(salaryCards.map((card) => card.currency || 'USD'))]
  if (currencies.length > 1) {
    return 'Mixed currencies'
  }

  const totalSalary = salaryCards.reduce((sum, card) => sum + Number(card.salary || 0), 0)
  const totalSalaryMax = salaryCards.reduce(
    (sum, card) => sum + Number(card.salaryMax || card.salary || 0),
    0,
  )

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencies[0],
    maximumFractionDigits: 0,
  })

  if (totalSalaryMax > totalSalary) {
    return `${formatter.format(totalSalary)} - ${formatter.format(totalSalaryMax)}`
  }

  return formatter.format(totalSalary)
}

function resolveTargetColumn(point, columnRefs) {
  for (const column of KANBAN_COLUMNS) {
    const columnElement = columnRefs.current[column]
    if (!columnElement) {
      continue
    }

    const rect = columnElement.getBoundingClientRect()
    const isInsideColumn =
      point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom

    if (isInsideColumn) {
      return column
    }
  }

  return null
}

function KanbanCard({ application, boardRef, onDragEnd }) {
  return (
    <motion.article
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900"
      drag
      dragConstraints={boardRef}
      dragElastic={0.1}
      dragMomentum={false}
      layout
      layoutId={application.id}
      onDragEnd={onDragEnd}
      whileDrag={{ rotate: 1.5, scale: 1.02, zIndex: 50 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{application.company}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <p className="inline-flex items-center gap-1">
          <FiMapPin className="h-3.5 w-3.5" />
          <span>
            {application.location || '--'} • {application.locationType || 'Remote'}
          </span>
        </p>
        <p className="font-medium text-slate-700 dark:text-slate-200">{formatSalary(application)}</p>
      </div>
    </motion.article>
  )
}

export default function KanbanBoard({ applications, onStatusChange }) {
  const boardRef = useRef(null)
  const columnRefs = useRef({})

  const groupedApplications = useMemo(() => {
    return KANBAN_COLUMNS.reduce((accumulator, columnStatus) => {
      accumulator[columnStatus] = applications.filter((application) => application.status === columnStatus)
      return accumulator
    }, {})
  }, [applications])

  return (
    <div className="overflow-x-auto" ref={boardRef}>
      <div className="grid min-w-[960px] grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map((columnStatus) => {
          const columnCards = groupedApplications[columnStatus]
          const salaryRange = aggregateSalaryRange(columnCards)

          return (
            <section
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-950"
              key={columnStatus}
              ref={(element) => {
                columnRefs.current[columnStatus] = element
              }}
            >
              <header className="mb-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{columnStatus}</p>
                  <motion.span
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    initial={{ scale: 0.85, opacity: 0.7 }}
                    key={`${columnStatus}-${columnCards.length}`}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {columnCards.length}
                  </motion.span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Total Salary: {salaryRange}
                </p>
              </header>

              {columnCards.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No applications in this column.
                </div>
              ) : (
                <motion.div className="space-y-3" layout>
                  {columnCards.map((application) => (
                    <KanbanCard
                      application={application}
                      boardRef={boardRef}
                      key={application.id}
                      onDragEnd={(_, info) => {
                        const targetColumn = resolveTargetColumn(info.point, columnRefs)

                        if (targetColumn && targetColumn !== application.status) {
                          onStatusChange(application.id, targetColumn)
                        }
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}