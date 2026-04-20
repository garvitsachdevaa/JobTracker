import { useApplicationContext } from '../context/ApplicationContext'

export default function useApplications() {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    toggleBookmark,
  } = useApplicationContext()

  return {
    applications,
    add: addApplication,
    update: updateApplication,
    delete: deleteApplication,
    toggleBookmark,
  }
}