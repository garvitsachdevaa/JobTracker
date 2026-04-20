import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import useLocalStorage from '../hooks/useLocalStorage'
import { fetchSeedApplications } from '../services/api'

const APPLICATION_STORAGE_KEY = 'jobtracker.applications'

const defaultFilters = {
  status: '',
  platform: '',
  locationType: '',
}

function normalizeApplication(application = {}) {
  const createdAt = application.createdAt ?? application.appliedDate ?? new Date().toISOString()
  const updatedAt = application.updatedAt ?? createdAt

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
    createdAt,
    updatedAt,
  }
}

const ApplicationContext = createContext(null)

export function ApplicationProvider({ children }) {
  const [applications, setApplications] = useLocalStorage(APPLICATION_STORAGE_KEY, [])
  const hasAttemptedSeedRef = useRef(false)
  const [offerCelebration, setOfferCelebration] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [filters, setFiltersState] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState('appliedDate')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('table')

  useEffect(() => {
    if (applications.length > 0 || hasAttemptedSeedRef.current) {
      return
    }

    hasAttemptedSeedRef.current = true
    setIsInitializing(true)
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
      } finally {
        if (isActive) {
          setIsInitializing(false)
        }
      }
    }

    seedApplications()

    return () => {
      isActive = false
    }
  }, [applications.length, setApplications])

  const addApplication = useCallback(
    (data) => {
      const timestamp = new Date().toISOString()
      const newApplication = normalizeApplication({
        ...data,
        createdAt: data?.createdAt ?? timestamp,
        updatedAt: timestamp,
      })
      setApplications((previousApplications) => [newApplication, ...previousApplications])
      toast.success(`Application added for ${newApplication.company || 'the company'}.`)
      return newApplication
    },
    [setApplications],
  )

  const updateApplication = useCallback(
    (id, data) => {
      let updatedApplication = null
      let previousStatus = null

      setApplications((previousApplications) =>
        previousApplications.map((application) => {
          if (application.id !== id) {
            return application
          }

          previousStatus = application.status

          updatedApplication = normalizeApplication({
            ...application,
            ...data,
            id: application.id,
            createdAt: application.createdAt,
            updatedAt: new Date().toISOString(),
          })

          return updatedApplication
        }),
      )

      if (updatedApplication) {
        if (previousStatus !== 'Offer' && updatedApplication.status === 'Offer') {
          const company = updatedApplication.company || 'this company'
          setOfferCelebration({
            company,
            id: updatedApplication.id,
            triggeredAt: Date.now(),
          })
          toast.success(`Congratulations! 🎉 You got an offer at ${company}!`)
        } else {
          toast.success(`Application updated for ${updatedApplication.company || 'the company'}.`)
        }
      }

      return updatedApplication
    },
    [setApplications],
  )

  const deleteApplication = useCallback(
    (id) => {
      let deletedCompany = 'application'

      setApplications((previousApplications) => {
        const deletedApplication = previousApplications.find((application) => application.id === id)
        if (deletedApplication?.company) {
          deletedCompany = deletedApplication.company
        }

        return previousApplications.filter((application) => application.id !== id)
      })

      toast.info(`Deleted ${deletedCompany}.`)
    },
    [setApplications],
  )

  const toggleBookmark = useCallback(
    (id) => {
      let bookmarkEnabled = false
      let companyName = 'application'

      setApplications((previousApplications) =>
        previousApplications.map((application) => {
          if (application.id !== id) {
            return application
          }

          bookmarkEnabled = !application.bookmarked
          companyName = application.company || companyName

          return {
            ...application,
            bookmarked: bookmarkEnabled,
          }
        }),
      )

      toast.info(
        bookmarkEnabled
          ? `${companyName} bookmarked.`
          : `${companyName} removed from bookmarks.`,
      )
    },
    [setApplications],
  )

  const clearOfferCelebration = useCallback(() => {
    setOfferCelebration(null)
  }, [])

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
      offerCelebration,
      clearOfferCelebration,
      isInitializing,
    }),
    [
      activeTab,
      addApplication,
      applications,
      clearOfferCelebration,
      deleteApplication,
      filters,
      isInitializing,
      offerCelebration,
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