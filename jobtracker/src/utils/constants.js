export const ROUTES = {
  dashboard: '/dashboard',
  applications: '/applications',
  addApplication: '/applications/new',
  analytics: '/analytics',
  bookmarks: '/bookmarks',
}

export const APP_STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Ghosted']

export const PLATFORM_OPTIONS = [
  'LinkedIn',
  'Naukri',
  'Company Website',
  'Referral',
  'AngelList',
  'Other',
]

export const LOCATION_TYPE_OPTIONS = ['Remote', 'Hybrid', 'On-site']

export const SORT_OPTIONS = [
  { value: 'appliedDate', label: 'Applied Date (Newest)' },
  { value: 'salary-desc', label: 'Salary (High to Low)' },
  { value: 'salary-asc', label: 'Salary (Low to High)' },
  { value: 'company', label: 'Company Name (A-Z)' },
]