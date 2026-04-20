import { addDays, format, startOfDay, subDays } from 'date-fns'
import { useMemo, useState } from 'react'

const HEATMAP_COLORS = ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#15803d']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getColorFromCount(count, maxCount) {
  if (count <= 0 || maxCount <= 0) {
    return '#e2e8f0'
  }

  const ratio = count / maxCount
  if (ratio <= 0.25) {
    return HEATMAP_COLORS[0]
  }

  if (ratio <= 0.5) {
    return HEATMAP_COLORS[1]
  }

  if (ratio <= 0.75) {
    return HEATMAP_COLORS[2]
  }

  if (ratio < 1) {
    return HEATMAP_COLORS[3]
  }

  return HEATMAP_COLORS[4]
}

export default function ApplicationHeatmap({ applications }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const { cells, maxCount } = useMemo(() => {
    const today = startOfDay(new Date())
    const firstDay = subDays(today, 90)

    const dayList = Array.from({ length: 91 }, (_, index) => addDays(firstDay, index))

    const dayCountMap = applications.reduce((accumulator, application) => {
      const appliedDate = toDate(application.appliedDate)
      if (!appliedDate) {
        return accumulator
      }

      const appliedKey = format(startOfDay(appliedDate), 'yyyy-MM-dd')
      accumulator[appliedKey] = (accumulator[appliedKey] || 0) + 1
      return accumulator
    }, {})

    const mappedCells = dayList.map((dayDate, index) => {
      const dateKey = format(dayDate, 'yyyy-MM-dd')
      const count = dayCountMap[dateKey] || 0

      return {
        id: dateKey,
        date: dayDate,
        dateLabel: format(dayDate, 'dd MMM yyyy'),
        count,
        x: Math.floor(index / 7),
        y: dayDate.getDay(),
      }
    })

    const highestCount = mappedCells.reduce(
      (accumulator, cell) => (cell.count > accumulator ? cell.count : accumulator),
      0,
    )

    return {
      cells: mappedCells,
      maxCount: highestCount,
    }
  }, [applications])

  const cellSize = 14
  const gap = 4
  const paddingLeft = 34
  const paddingTop = 8
  const width = paddingLeft + 13 * (cellSize + gap)
  const height = paddingTop + 7 * (cellSize + gap) + 6

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <svg height={height} width={width}>
          {DAY_LABELS.map((dayLabel, dayIndex) => (
            <text
              fill="#64748b"
              fontSize="10"
              key={dayLabel}
              textAnchor="start"
              x={0}
              y={paddingTop + dayIndex * (cellSize + gap) + 11}
            >
              {dayLabel}
            </text>
          ))}

          {cells.map((cell) => {
            const x = paddingLeft + cell.x * (cellSize + gap)
            const y = paddingTop + cell.y * (cellSize + gap)

            return (
              <rect
                fill={getColorFromCount(cell.count, maxCount)}
                height={cellSize}
                key={cell.id}
                onMouseEnter={() => {
                  setHoveredCell({
                    dateLabel: cell.dateLabel,
                    count: cell.count,
                  })
                }}
                onMouseLeave={() => {
                  setHoveredCell(null)
                }}
                rx={3}
                ry={3}
                stroke="#cbd5e1"
                strokeWidth="1"
                width={cellSize}
                x={x}
                y={y}
              >
                <title>{`${cell.dateLabel}: ${cell.count} application${cell.count === 1 ? '' : 's'}`}</title>
              </rect>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {hoveredCell
            ? `${hoveredCell.dateLabel}: ${hoveredCell.count} application${hoveredCell.count === 1 ? '' : 's'}`
            : 'Hover over a cell to inspect activity'}
        </p>

        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((index) => (
            <span
              className="inline-block h-3 w-3 rounded-sm border border-slate-300"
              key={index}
              style={{ backgroundColor: HEATMAP_COLORS[index] }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}