import { differenceInCalendarDays, startOfDay } from 'date-fns'
import { useMemo } from 'react'
import { useApplicationContext } from '../context/ApplicationContext'

function toDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export default function useApplications() {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    toggleBookmark,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    isInitializing,
  } = useApplicationContext()

  const ghostedSuggestions = useMemo(() => {
    const today = startOfDay(new Date())

    return applications
      .filter((application) => {
        if (application.status !== 'Applied') {
          return false
        }

        const appliedDate = toDate(application.appliedDate)
        if (!appliedDate) {
          return false
        }

        const updatedDate = toDate(application.updatedAt || application.appliedDate)
        const daysSinceApplied = differenceInCalendarDays(today, startOfDay(appliedDate))
        const daysBetweenApplyAndUpdate = differenceInCalendarDays(
          startOfDay(updatedDate || appliedDate),
          startOfDay(appliedDate),
        )

        return daysSinceApplied > 21 && daysBetweenApplyAndUpdate <= 1
      })
      .map((application) => application.id)
  }, [applications])

  const ghostedSuggestionSet = useMemo(() => {
    return new Set(ghostedSuggestions)
  }, [ghostedSuggestions])

  function markAsGhosted(id) {
    return updateApplication(id, { status: 'Ghosted' })
  }

  function isGhostedSuggestion(id) {
    return ghostedSuggestionSet.has(id)
  }

  return {
    applications,
    add: addApplication,
    update: updateApplication,
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
    ghostedSuggestions,
    markAsGhosted,
    isGhostedSuggestion,
    isInitializing,
  }
}