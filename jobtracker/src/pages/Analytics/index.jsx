import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ApplicationHeatmap from '../../components/Charts/ApplicationHeatmap'
import EmptyState from '../../components/EmptyState/EmptyState'
import useApplications from '../../hooks/useApplications'
import { LOCATION_TYPE_OPTIONS, PLATFORM_OPTIONS } from '../../utils/constants'

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Interviewing: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#f43f5e',
  Ghosted: '#94a3b8',
}

const PLATFORM_COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f97316']
const LOCATION_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b']

function toDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = typeof value === 'string' ? parseISO(value) : new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function compactNumber(value) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function currencyNumber(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function ChartCard({ children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      {children}
    </section>
  )
}

function MetricCard({ label, value, subValue }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subValue}</p>
    </div>
  )
}

function ValueTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-slate-100">{label || payload[0].name || '--'}</p>
      {payload.map((point) => (
        <p className="mt-1 text-slate-600 dark:text-slate-300" key={`${point.name}-${point.dataKey}`}>
          {point.name}: {typeof point.value === 'number' ? compactNumber(point.value) : point.value}
        </p>
      ))}
    </div>
  )
}

function SalaryTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const company = payload[0]?.payload?.company || '--'
  const minValue = payload.find((item) => item.dataKey === 'min')?.value || 0
  const maxValue = payload.find((item) => item.dataKey === 'max')?.value || 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-slate-100">{company}</p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">Min: {currencyNumber(minValue)}</p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">Max: {currencyNumber(maxValue)}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { applications } = useApplications()

  const stats = useMemo(() => {
    const respondedStatuses = new Set(['Interviewing', 'Offer', 'Rejected'])

    const durations = applications
      .map((application) => {
        const appliedDate = toDate(application.appliedDate)
        const interviewDate = toDate(application.interviewDate)

        if (!appliedDate || !interviewDate) {
          return null
        }

        const dayDifference = differenceInCalendarDays(interviewDate, appliedDate)
        return dayDifference >= 0 ? dayDifference : null
      })
      .filter((value) => value !== null)

    const averageApplyToInterview =
      durations.length > 0
        ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
        : 0

    const platformCountMap = applications.reduce((accumulator, application) => {
      const platform = application.platform || 'Other'
      accumulator[platform] = (accumulator[platform] || 0) + 1
      return accumulator
    }, {})

    const mostActivePlatformEntry = Object.entries(platformCountMap).sort((leftEntry, rightEntry) => {
      return rightEntry[1] - leftEntry[1]
    })[0]

    const monthlyResponseMap = applications.reduce((accumulator, application) => {
      const appliedDate = toDate(application.appliedDate)
      if (!appliedDate) {
        return accumulator
      }

      const monthStart = startOfMonth(appliedDate)
      const monthKey = format(monthStart, 'yyyy-MM')

      if (!accumulator[monthKey]) {
        accumulator[monthKey] = {
          monthDate: monthStart,
          monthLabel: format(monthStart, 'MMM yyyy'),
          total: 0,
          responses: 0,
        }
      }

      accumulator[monthKey].total += 1
      if (respondedStatuses.has(application.status)) {
        accumulator[monthKey].responses += 1
      }

      return accumulator
    }, {})

    const bestResponseMonth = Object.values(monthlyResponseMap)
      .map((entry) => ({
        ...entry,
        rate: entry.total > 0 ? entry.responses / entry.total : 0,
      }))
      .sort((leftEntry, rightEntry) => {
        if (rightEntry.rate !== leftEntry.rate) {
          return rightEntry.rate - leftEntry.rate
        }

        return rightEntry.monthDate - leftEntry.monthDate
      })[0]

    return {
      averageApplyToInterview,
      mostActivePlatform: mostActivePlatformEntry ? mostActivePlatformEntry[0] : '--',
      mostActivePlatformCount: mostActivePlatformEntry ? mostActivePlatformEntry[1] : 0,
      bestResponseMonthLabel: bestResponseMonth
        ? `${bestResponseMonth.monthLabel} (${Math.round(bestResponseMonth.rate * 100)}%)`
        : '--',
    }
  }, [applications])

  const funnelData = useMemo(() => {
    const total = applications.length
    const interviewingStage = applications.filter((application) =>
      ['Interviewing', 'Offer', 'Rejected'].includes(application.status),
    ).length
    const offerStage = applications.filter((application) => application.status === 'Offer').length

    return [
      { name: 'Applied', value: total, fill: STATUS_COLORS.Applied },
      { name: 'Interviewing', value: interviewingStage, fill: STATUS_COLORS.Interviewing },
      { name: 'Offer', value: offerStage, fill: STATUS_COLORS.Offer },
    ]
  }, [applications])

  const cumulativeData = useMemo(() => {
    const today = startOfDay(new Date())
    const startDate = subDays(today, 89)

    const dayList = Array.from({ length: 90 }, (_, index) => addDays(startDate, index))
    const dayCountMap = applications.reduce((accumulator, application) => {
      const appliedDate = toDate(application.appliedDate)
      if (!appliedDate) {
        return accumulator
      }

      const appliedDay = startOfDay(appliedDate)
      const key = format(appliedDay, 'yyyy-MM-dd')
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    let runningTotal = 0

    return dayList.map((dayDate) => {
      const dayKey = format(dayDate, 'yyyy-MM-dd')
      runningTotal += dayCountMap[dayKey] || 0

      return {
        dayKey,
        dayLabel: format(dayDate, 'dd MMM'),
        cumulative: runningTotal,
        fullDate: format(dayDate, 'dd MMM yyyy'),
      }
    })
  }, [applications])

  const platformData = useMemo(() => {
    const countMap = applications.reduce((accumulator, application) => {
      const platform = application.platform || 'Other'
      accumulator[platform] = (accumulator[platform] || 0) + 1
      return accumulator
    }, {})

    return PLATFORM_OPTIONS.map((platform, index) => ({
      name: platform,
      value: countMap[platform] || 0,
      fill: PLATFORM_COLORS[index % PLATFORM_COLORS.length],
    }))
  }, [applications])

  const locationTypeData = useMemo(() => {
    const countMap = applications.reduce((accumulator, application) => {
      const locationType = application.locationType || 'Remote'
      accumulator[locationType] = (accumulator[locationType] || 0) + 1
      return accumulator
    }, {})

    return LOCATION_TYPE_OPTIONS.map((locationType, index) => ({
      name: locationType,
      value: countMap[locationType] || 0,
      fill: LOCATION_COLORS[index % LOCATION_COLORS.length],
    }))
  }, [applications])

  const salaryDistributionData = useMemo(() => {
    return [...applications]
      .filter((application) => Number(application.salary || 0) > 0)
      .sort((leftApplication, rightApplication) => Number(leftApplication.salary || 0) - Number(rightApplication.salary || 0))
      .map((application, index) => ({
        order: index + 1,
        company: application.company || `Application ${index + 1}`,
        min: Number(application.salary || 0),
        max: Number(application.salaryMax || application.salary || 0),
      }))
  }, [applications])

  if (applications.length === 0) {
    return (
      <section className="space-y-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Analytics</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Insights</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Analyze conversion trends and activity patterns once applications are available.
          </p>
        </header>

        <EmptyState
          description="Add applications first to unlock charts, funnel insights, and activity heatmaps."
          title="No analytics data yet"
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Insights</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review conversion funnel performance, platform distribution, and activity intensity over time.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Avg Apply To Interview"
          subValue="Average days between applied date and interview date"
          value={`${stats.averageApplyToInterview} days`}
        />
        <MetricCard
          label="Most Active Platform"
          subValue={`${stats.mostActivePlatformCount} applications tracked`}
          value={stats.mostActivePlatform}
        />
        <MetricCard
          label="Best Response Month"
          subValue="Highest monthly heard-back ratio"
          value={stats.bestResponseMonthLabel}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Offer Conversion Funnel</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer height="100%" width="100%">
              <RadialBarChart
                barSize={18}
                cx="50%"
                cy="50%"
                data={funnelData}
                innerRadius="15%"
                outerRadius="90%"
              >
                <PolarAngleAxis domain={[0, Math.max(funnelData[0]?.value || 1, 1)]} tick={false} type="number" />
                <RadialBar background cornerRadius={8} dataKey="value" />
                <Legend iconType="circle" verticalAlign="bottom" />
                <Tooltip content={<ValueTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Cumulative Applications (90 Days)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={cumulativeData} margin={{ top: 8, right: 8, left: -18, bottom: 6 }}>
                <CartesianGrid stroke="#33415522" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="dayLabel"
                  minTickGap={26}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} />
                <Tooltip content={<ValueTooltip />} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || '--'} />
                <Line dataKey="cumulative" dot={false} name="Cumulative" stroke="#4f46e5" strokeWidth={2.5} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Applications By Platform</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={platformData} margin={{ top: 8, right: 8, left: -18, bottom: 6 }}>
                <CartesianGrid stroke="#33415522" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  minTickGap={16}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} />
                <Tooltip content={<ValueTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {platformData.map((entry) => (
                    <Cell fill={entry.fill} key={entry.name} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Location Type Breakdown</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={locationTypeData} dataKey="value" innerRadius={65} nameKey="name" outerRadius={95}>
                  {locationTypeData.map((entry) => (
                    <Cell fill={entry.fill} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip content={<ValueTooltip />} />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Application Activity Heatmap</p>
          <div className="mt-4">
            <ApplicationHeatmap applications={applications} />
          </div>
        </ChartCard>

        <ChartCard>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Salary Range Distribution</p>
          {salaryDistributionData.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No salary data available yet.</p>
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={salaryDistributionData} margin={{ top: 8, right: 8, left: -18, bottom: 6 }}>
                  <CartesianGrid stroke="#33415522" strokeDasharray="3 3" />
                  <XAxis
                    axisLine={false}
                    dataKey="order"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => compactNumber(value)}
                    tickLine={false}
                  />
                  <Tooltip content={<SalaryTooltip />} />
                  <Legend />
                  <Area
                    dataKey="max"
                    fill="#4f46e555"
                    name="Max Salary"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Area
                    dataKey="min"
                    fill="#22c55e33"
                    name="Min Salary"
                    stroke="#16a34a"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </section>
  )
}