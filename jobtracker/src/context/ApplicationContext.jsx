import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { fetchSeedApplications } from '../services/api'

const APPLICATION_STORAGE_KEY = 'jobtracker.applications'

const defaultFilters = {
  status: '',
  platform: '',
  locationType: '',
}

function normalizeApplication(application = {}) {
  return {
    id: application.id ?? crypto.randomUUID(),
    company: application.company ?? '',
    role: application.role ?? '',
    location: application.location ?? '',
    locationType: application.locationType ?? 'Remote',
    salary: application.salary ?? null,
    salaryMax: application.salaryMax ?? null,
    currency: application.currency ?? 'USD',
    platform: application.platform ?? 'LinkedIn',
    status: application.status ?? 'Applied',
    appliedDate: application.appliedDate ?? new Date().toISOString(),
    interviewDate: application.interviewDate ?? null,
    notes: application.notes ?? '',
    bookmarked: application.bookmarked ?? false,
    tags: Array.isArray(application.tags) ? application.tags : [],
    fitScore: application.fitScore ?? 0,
    followUpDate: application.followUpDate ?? null,
    resumeVersion: application.resumeVersion ?? '',
  }
}

const ApplicationContext = createContext(null)

export function ApplicationProvider({ children }) {
  const [applications, setApplications] = useLocalStorage(APPLICATION_STORAGE_KEY, [])
  const hasAttemptedSeedRef = useRef(false)
  const [filters, setFiltersState] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState('appliedDate')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('table')

  useEffect(() => {
    if (applications.length > 0 || hasAttemptedSeedRef.current) {
      return
    }

    hasAttemptedSeedRef.current = true
    let isActive = true

    async function seedApplications() {
      try {
        const seededApplications = await fetchSeedApplications(10)

        if (!isActive || seededApplications.length === 0) {
          return
        }

        setApplications(seededApplications.map((application) => normalizeApplication(application)))
      } catch (error) {
        console.error('Unable to seed applications from dummyjson.', error)
      }
    }

    seedApplications()

    return () => {
      isActive = false
    }
  }, [applications.length, setApplications])

  const addApplication = useCallback(
    (data) => {
      const newApplication = normalizeApplication(data)
      setApplications((previousApplications) => [newApplication, ...previousApplications])
      return newApplication
    },
    [setApplications],
  )

  const updateApplication = useCallback(
    (id, data) => {
      let updatedApplication = null

      setApplications((previousApplications) =>
        previousApplications.map((application) => {
          if (application.id !== id) {
            return application
          }

          updatedApplication = normalizeApplication({
            ...application,
            ...data,
            id: application.id,
          })

          return updatedApplication
        }),
      )

      return updatedApplication
    },
    [setApplications],
  )

  const deleteApplication = useCallback(
    (id) => {
      setApplications((previousApplications) =>
        previousApplications.filter((application) => application.id !== id),
      )
    },
    [setApplications],
  )

  const toggleBookmark = useCallback(
    (id) => {
      setApplications((previousApplications) =>
        previousApplications.map((application) => {
          if (application.id !== id) {
            return application
          }

          return {
            ...application,
            bookmarked: !application.bookmarked,
          }
        }),
      )
    },
    [setApplications],
  )

  const setFilters = useCallback((nextFilters) => {
    if (typeof nextFilters === 'function') {
      setFiltersState(nextFilters)
      return
    }

    setFiltersState((previousFilters) => ({
      ...previousFilters,
      ...nextFilters,
    }))
  }, [])

  const value = useMemo(
    () => ({
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
    }),
    [
      activeTab,
      addApplication,
      applications,
      deleteApplication,
      filters,
      searchQuery,
      setFilters,
      sortBy,
      toggleBookmark,
      updateApplication,
    ],
  )

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext)

  if (!context) {
    throw new Error('useApplicationContext must be used within ApplicationProvider')
  }

  return context
}