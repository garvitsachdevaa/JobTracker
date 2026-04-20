import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
})

const seedStatuses = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Ghosted']
const seedPlatforms = ['LinkedIn', 'Naukri', 'Company Website', 'Referral', 'AngelList', 'Other']
const seedLocationTypes = ['Remote', 'Hybrid', 'On-site']
const seedCurrencies = ['USD', 'INR', 'EUR', 'GBP']
const seedLocations = [
  'Bengaluru',
  'Remote - India',
  'Berlin',
  'London',
  'San Francisco',
  'Amsterdam',
  'Pune',
  'New York',
  'Dublin',
  'Toronto',
]
const seedRoles = [
  'Frontend Engineer',
  'Full Stack Developer',
  'React Developer',
  'Product Engineer',
  'Software Engineer',
  'UI Engineer',
  'JavaScript Developer',
  'Platform Engineer',
  'Web Engineer',
  'Application Developer',
]

function toIsoDateWithOffset(dayOffset) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  return date.toISOString()
}

function mapProductToApplication(product, index) {
  const status = seedStatuses[index % seedStatuses.length]
  const locationType = seedLocationTypes[index % seedLocationTypes.length]
  const currency = seedCurrencies[index % seedCurrencies.length]
  const salary = Number(product?.price || 60) * 1000
  const salaryMax = salary + 25000 + index * 1200
  const appliedDate = toIsoDateWithOffset(-(index * 4 + 3))
  const shouldScheduleInterview = status === 'Interviewing' || status === 'Offer'
  const interviewDate = shouldScheduleInterview ? toIsoDateWithOffset(index % 2 === 0 ? index + 1 : -(index + 2)) : null
  const followUpDate = status === 'Applied' ? toIsoDateWithOffset(index + 1) : null
  const noteText = typeof product?.description === 'string' ? product.description : 'Follow-up pending.'

  return {
    id: crypto.randomUUID(),
    company: product?.brand || `${product?.title || 'Acme'} Labs`,
    role: seedRoles[index % seedRoles.length],
    location: seedLocations[index % seedLocations.length],
    locationType,
    salary,
    salaryMax,
    currency,
    platform: seedPlatforms[index % seedPlatforms.length],
    status,
    appliedDate,
    interviewDate,
    notes: noteText,
    bookmarked: index % 3 === 0,
    tags: [product?.category, product?.title].filter(Boolean).slice(0, 2),
    fitScore: Math.min(95, 52 + index * 4),
    followUpDate,
    resumeVersion: `v${(index % 4) + 1}-general`,
  }
}

export async function fetchSeedApplications(limit = 10) {
  const response = await api.get(`/products?limit=${limit}`)
  const products = Array.isArray(response?.data?.products) ? response.data.products : []
  return products.map(mapProductToApplication).slice(0, 10)
}

export default api