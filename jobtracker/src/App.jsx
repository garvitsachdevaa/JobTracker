import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ConfettiCelebration from './components/ConfettiCelebration/ConfettiCelebration'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import SidebarLayout from './components/Navbar/SidebarLayout'
import { useApplicationContext } from './context/ApplicationContext'

const DashboardPage = lazy(() => import('./pages/Dashboard'))
const ApplicationsPage = lazy(() => import('./pages/Applications'))
const AddApplicationPage = lazy(() => import('./pages/AddApplication'))
const EditApplicationPage = lazy(() => import('./pages/EditApplication'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const BookmarksPage = lazy(() => import('./pages/Bookmarks'))

export default function App() {
  const { clearOfferCelebration, offerCelebration, isInitializing } = useApplicationContext()
  const location = useLocation()

  return (
    <>
      <SidebarLayout>
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={location.pathname}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
              <Routes location={location}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/applications/new" element={<AddApplicationPage />} />
                <Route path="/applications/:id" element={<EditApplicationPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </SidebarLayout>

      {isInitializing ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-6 backdrop-blur-[1px]">
          <div className="w-full max-w-sm">
            <LoadingSpinner message="Fetching starter applications..." />
          </div>
        </div>
      ) : null}

      <ConfettiCelebration
        active={Boolean(offerCelebration)}
        onComplete={clearOfferCelebration}
      />
    </>
  )
}