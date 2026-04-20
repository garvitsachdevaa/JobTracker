import { useNavigate } from 'react-router-dom'
import useApplications from '../../hooks/useApplications'
import { ROUTES } from '../../utils/constants'
import ApplicationForm from './ApplicationForm'

export default function AddApplicationPage() {
  const navigate = useNavigate()
  const { add } = useApplications()

  async function handleCreate(values) {
    add(values)
    navigate(ROUTES.applications)
  }

  return (
    <ApplicationForm
      mode="add"
      onCancel={() => navigate(ROUTES.applications)}
      onSubmitForm={handleCreate}
      submitLabel="Save Application"
    />
  )
}