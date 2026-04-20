import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns'
import { animate, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/EmptyState/EmptyState'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import useApplications from '../../hooks/useApplications'

function toDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = typeof value === 'string' ? parseISO(value) : new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function AnimatedNumber({ className, suffix = '', value }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
    })

    return () => {
      controls.stop()
    }
  }, [value])

  return (
    <p className={className}>
      {displayValue}
      {suffix}
    </p>
  )
}

function PercentageRing({ label, value }) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const strokeDashoffset = circumference - progress

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" fill="transparent" r={radius} stroke="#cbd5e1" strokeWidth="12" />
          <motion.circle
            animate={{ strokeDashoffset }}
            cx="60"
            cy="60"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            stroke="#4f46e5"
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth="12"
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber className="text-lg font-semibold text-slate-900 dark:text-slate-100" suffix="%" value={value} />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Based on all tracked applications</p>
      </div>
    </div>
  )
}

function StatCard({ children }) {
  return (
    <motion.article
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.article>
  )
}

function countdownBadge(interviewDate) {
  const today = startOfDay(new Date())
  const interviewDay = startOfDay(interviewDate)
  const days = differenceInCalendarDays(interviewDay, today)

  if (days <= 0) {
    return 'Today!'
  }

  if (days === 1) {
    return 'Tomorrow'
  }

  return `in ${days} days`
}

export default function DashboardPage() {
  const { applications } = useApplications()

  const metrics = useMemo(() => {
    const total = applications.length
    const interviewing = applications.filter((application) => application.status === 'Interviewing').length
    const offers = applications.filter((application) => application.status === 'Offer').length
    const rejected = applications.filter((application) => application.status === 'Rejected').length
    const heardBack = applications.filter((application) =>
      ['Interviewing', 'Offer', 'Rejected'].includes(application.status),
    ).length

    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0
    const responseRate = total > 0 ? Math.round((heardBack / total) * 100) : 0

    return {
      total,
      interviewing,
      offers,
      rejectionRate,
      responseRate,
    }
  }, [applications])

  const followUpDueSoon = useMemo(() => {
    const today = startOfDay(new Date())
    const reminderEnd = new Date(today)
    reminderEnd.setDate(today.getDate() + 3)

    return applications.filter((application) => {
      if (application.status !== 'Applied' || !application.followUpDate) {
        return false
      }

      const followUpDate = toDate(application.followUpDate)
      if (!followUpDate) {
        return false
      }

      const followUpDay = startOfDay(followUpDate)
      return (isAfter(followUpDay, today) || isSameDay(followUpDay, today)) &&
        (isBefore(followUpDay, reminderEnd) || isSameDay(followUpDay, reminderEnd))
    })
  }, [applications])

  const upcomingInterviews = useMemo(() => {
    const today = startOfDay(new Date())
    const rangeEnd = new Date(today)
    rangeEnd.setDate(today.getDate() + 14)

    return applications
      .map((application) => ({
        ...application,
        interviewDateValue: toDate(application.interviewDate),
      }))
      .filter((application) => {
        if (!application.interviewDateValue) {
          return false
        }

        const interviewDay = startOfDay(application.interviewDateValue)
        return (isAfter(interviewDay, today) || isSameDay(interviewDay, today)) &&
          (isBefore(interviewDay, rangeEnd) || isSameDay(interviewDay, rangeEnd))
      })
      .sort((leftApplication, rightApplication) => leftApplication.interviewDateValue - rightApplication.interviewDateValue)
  }, [applications])

  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((leftApplication, rightApplication) => {
        const leftDate = toDate(leftApplication.updatedAt || leftApplication.appliedDate)
        const rightDate = toDate(rightApplication.updatedAt || rightApplication.appliedDate)
        return (rightDate?.getTime() || 0) - (leftDate?.getTime() || 0)
      })
      .slice(0, 5)
      .map((application) => {
        const createdAtDate = toDate(application.createdAt || application.appliedDate)
        const updatedAtDate = toDate(application.updatedAt || application.appliedDate)

        const wasUpdated =
          Boolean(createdAtDate && updatedAtDate) &&
          Math.abs(updatedAtDate.getTime() - createdAtDate.getTime()) > 120000

        return {
          ...application,
          activityType: wasUpdated ? 'Updated' : 'Added',
          activityDate: updatedAtDate || createdAtDate,
        }
      })
  }, [applications])

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Overview</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track progress, monitor interview timelines, and stay ahead of follow-ups.
        </p>
      </header>

      {followUpDueSoon.length > 0 ? (
        <motion.div
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/60 dark:bg-amber-500/15"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-amber-700 dark:text-amber-300">Follow-up reminder</p>
          <p className="mt-1 text-sm font-medium text-amber-800 dark:text-amber-200">
            You have {followUpDueSoon.length} follow-up{followUpDueSoon.length > 1 ? 's' : ''} due soon.
          </p>
        </motion.div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Applications</p>
          <AnimatedNumber className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100" value={metrics.total} />
        </StatCard>

        <StatCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Interviewing</p>
          <AnimatedNumber className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100" value={metrics.interviewing} />
        </StatCard>

        <StatCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Offers Received</p>
          <AnimatedNumber className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100" value={metrics.offers} />
        </StatCard>

        <StatCard>
          <PercentageRing label="Rejection Rate" value={metrics.rejectionRate} />
        </StatCard>

        <StatCard>
          <PercentageRing label="Response Rate" value={metrics.responseRate} />
        </StatCard>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          description="Add applications to unlock dashboard insights and reminders."
          title="No dashboard data yet"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Upcoming Interviews
            </p>

            {upcomingInterviews.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No interviews scheduled in the next 14 days.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcomingInterviews.map((application) => (
                  <li
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                    key={application.id}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{application.company}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{application.role}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {format(application.interviewDateValue, 'EEE, dd MMM yyyy')}
                      </p>
                    </div>

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {countdownBadge(application.interviewDateValue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Recent Activity
            </p>

            {recentActivity.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No recent application activity available.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {recentActivity.map((activity) => (
                  <li className="relative pl-5" key={activity.id}>
                    <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {activity.activityType} {activity.company} • {activity.role}
                      </p>
                      <StatusBadge status={activity.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {activity.activityDate
                        ? `${formatDistanceToNow(activity.activityDate, { addSuffix: true })} • ${format(activity.activityDate, 'dd MMM yyyy')}`
                        : '--'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  )
}