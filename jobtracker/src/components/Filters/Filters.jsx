import { FiColumns, FiList } from 'react-icons/fi'
import {
  APP_STATUS_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  SORT_OPTIONS,
} from '../../utils/constants'

function selectClassName() {
  return 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors duration-150 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
}

function toggleClassName(isActive) {
  return [
    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200'
      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  ].join(' ')
}

export default function Filters({
  filters,
  onFilterChange,
  sortBy,
  onSortByChange,
  activeTab,
  onActiveTabChange,
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="block xl:col-span-1">
        <span className="sr-only">Filter by status</span>
        <select
          className={selectClassName()}
          onChange={(event) => onFilterChange('status', event.target.value)}
          value={filters.status}
        >
          <option value="">All Statuses</option>
          {APP_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block xl:col-span-1">
        <span className="sr-only">Filter by platform</span>
        <select
          className={selectClassName()}
          onChange={(event) => onFilterChange('platform', event.target.value)}
          value={filters.platform}
        >
          <option value="">All Platforms</option>
          {PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </label>

      <label className="block xl:col-span-1">
        <span className="sr-only">Filter by location type</span>
        <select
          className={selectClassName()}
          onChange={(event) => onFilterChange('locationType', event.target.value)}
          value={filters.locationType}
        >
          <option value="">All Location Types</option>
          {LOCATION_TYPE_OPTIONS.map((locationType) => (
            <option key={locationType} value={locationType}>
              {locationType}
            </option>
          ))}
        </select>
      </label>

      <label className="block xl:col-span-1">
        <span className="sr-only">Sort applications</span>
        <select
          className={selectClassName()}
          onChange={(event) => onSortByChange(event.target.value)}
          value={sortBy}
        >
          {SORT_OPTIONS.map((sortOption) => (
            <option key={sortOption.value} value={sortOption.value}>
              {sortOption.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-stretch gap-2 md:col-span-2 xl:col-span-2 xl:justify-end">
        <button
          className={toggleClassName(activeTab === 'table')}
          onClick={() => onActiveTabChange('table')}
          type="button"
        >
          <FiList className="h-4 w-4" />
          <span>Table</span>
        </button>
        <button
          className={toggleClassName(activeTab === 'kanban')}
          onClick={() => onActiveTabChange('kanban')}
          type="button"
        >
          <FiColumns className="h-4 w-4" />
          <span>Kanban</span>
        </button>
      </div>
    </div>
  )
}