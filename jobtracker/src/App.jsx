import { Navigate, Route, Routes } from 'react-router-dom'
import ConfettiCelebration from './components/ConfettiCelebration/ConfettiCelebration'
import SidebarLayout from './components/Navbar/SidebarLayout'
import { useApplicationContext } from './context/ApplicationContext'
import AddApplicationPage from './pages/AddApplication'
import AnalyticsPage from './pages/Analytics'
import ApplicationsPage from './pages/Applications'
import BookmarksPage from './pages/Bookmarks'
import DashboardPage from './pages/Dashboard'
import EditApplicationPage from './pages/EditApplication'

export default function App() {
  const { clearOfferCelebration, offerCelebration } = useApplicationContext()

  return (
    <>
      <SidebarLayout>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/new" element={<AddApplicationPage />} />
          <Route path="/applications/:id" element={<EditApplicationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarLayout>

      <ConfettiCelebration
        active={Boolean(offerCelebration)}
        onComplete={clearOfferCelebration}
      />
    </>
  )
}