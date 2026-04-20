import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BookmarkCard from '../../components/JobCard/BookmarkCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import useApplications from '../../hooks/useApplications'
import { ROUTES } from '../../utils/constants'

export default function BookmarksPage() {
  const { applications, toggleBookmark } = useApplications()

  const bookmarkedApplications = useMemo(() => {
    return [...applications]
      .filter((application) => application.bookmarked)
      .sort(
        (leftApplication, rightApplication) =>
          new Date(rightApplication.updatedAt || rightApplication.appliedDate).getTime() -
          new Date(leftApplication.updatedAt || leftApplication.appliedDate).getTime(),
      )
  }, [applications])

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Bookmarks</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Saved Jobs</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Keep high-priority applications in one place and quickly remove bookmarks when they are no longer needed.
        </p>
      </header>

      {bookmarkedApplications.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
              to={ROUTES.applications}
            >
              Browse Applications
            </Link>
          }
          description="Bookmark jobs from the Applications page to see them here."
          title="No bookmarked jobs"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookmarkedApplications.map((application) => (
            <BookmarkCard application={application} key={application.id} onRemove={toggleBookmark} />
          ))}
        </div>
      )}
    </section>
  )
}