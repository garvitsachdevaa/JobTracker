import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState/EmptyState'
import useApplications from '../../hooks/useApplications'
import { ROUTES } from '../../utils/constants'
import ApplicationForm from '../AddApplication/ApplicationForm'

export default function EditApplicationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { applications, update } = useApplications()
  const currentApplication = applications.find((application) => application.id === id)

  async function handleUpdate(values) {
    update(id, values)
    navigate(ROUTES.applications)
  }

  if (!currentApplication) {
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500"
            to={ROUTES.applications}
          >
            Back to Applications
          </Link>
        }
        description="The selected application could not be found. It may have been deleted."
        title="Application not found"
      />
    )
  }

  return (
    <ApplicationForm
      initialData={currentApplication}
      mode="edit"
      onCancel={() => navigate(ROUTES.applications)}
      onSubmitForm={handleUpdate}
      submitLabel="Update Application"
    />
  )
}