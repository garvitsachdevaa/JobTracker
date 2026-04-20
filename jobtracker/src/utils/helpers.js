const CSV_FIELDS = [
	'id',
	'company',
	'role',
	'location',
	'locationType',
	'salary',
	'salaryMax',
	'currency',
	'platform',
	'status',
	'appliedDate',
	'interviewDate',
	'notes',
	'bookmarked',
	'tags',
	'fitScore',
	'followUpDate',
	'resumeVersion',
	'createdAt',
	'updatedAt',
]

function escapeCsvValue(value) {
	if (value === null || typeof value === 'undefined') {
		return ''
	}

	const asString = String(value)
	if (asString.includes(',') || asString.includes('"') || asString.includes('\n')) {
		return `"${asString.replace(/"/g, '""')}"`
	}

	return asString
}

function normalizeFieldValue(application, fieldName) {
	if (fieldName === 'tags') {
		return Array.isArray(application.tags) ? application.tags.join('|') : ''
	}

	return application[fieldName]
}

export function applicationsToCsv(applications = []) {
	const header = CSV_FIELDS.join(',')
	const rows = applications.map((application) => {
		return CSV_FIELDS.map((fieldName) => {
			const value = normalizeFieldValue(application, fieldName)
			return escapeCsvValue(value)
		}).join(',')
	})

	return [header, ...rows].join('\n')
}

export function exportApplicationsToCsv(applications = [], fileName = 'applications.csv') {
	if (typeof window === 'undefined' || applications.length === 0) {
		return false
	}

	const csvContent = applicationsToCsv(applications)
	const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const objectUrl = window.URL.createObjectURL(csvBlob)

	const downloadAnchor = document.createElement('a')
	downloadAnchor.href = objectUrl
	downloadAnchor.setAttribute('download', fileName)
	document.body.appendChild(downloadAnchor)
	downloadAnchor.click()
	document.body.removeChild(downloadAnchor)
	window.URL.revokeObjectURL(objectUrl)

	return true
}

export function noop() {}