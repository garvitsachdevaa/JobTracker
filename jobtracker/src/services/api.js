import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 4500,
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

const fallbackSeedProducts = [
  {
    title: 'Nova Commerce',
    brand: 'Nova Commerce',
    category: 'Ecommerce',
    description: 'Building storefront experiences and checkout optimizations.',
    price: 74,
  },
  {
    title: 'Skyline Health',
    brand: 'Skyline Health',
    category: 'HealthTech',
    description: 'Patient engagement dashboard and appointment workflows.',
    price: 68,
  },
  {
    title: 'Ledger Loop',
    brand: 'Ledger Loop',
    category: 'FinTech',
    description: 'Modern financial operations tooling for startups.',
    price: 82,
  },
  {
    title: 'Atlas Mobility',
    brand: 'Atlas Mobility',
    category: 'SaaS',
    description: 'Fleet operations and route intelligence platform.',
    price: 71,
  },
  {
    title: 'Pulse Metrics',
    brand: 'Pulse Metrics',
    category: 'Analytics',
    description: 'Realtime dashboards and product analytics suite.',
    price: 76,
  },
  {
    title: 'Orbit Labs',
    brand: 'Orbit Labs',
    category: 'Developer Tools',
    description: 'CI insights and engineering productivity workflows.',
    price: 79,
  },
  {
    title: 'Fjord Studio',
    brand: 'Fjord Studio',
    category: 'Design Systems',
    description: 'Component platform for consistent product UI.',
    price: 66,
  },
  {
    title: 'Beacon Security',
    brand: 'Beacon Security',
    category: 'Cybersecurity',
    description: 'Identity protection and security posture tooling.',
    price: 88,
  },
  {
    title: 'Harvest Grid',
    brand: 'Harvest Grid',
    category: 'ClimateTech',
    description: 'Energy monitoring and sustainability operations.',
    price: 73,
  },
  {
    title: 'Cobalt Cloud',
    brand: 'Cobalt Cloud',
    category: 'Cloud',
    description: 'Infrastructure automation and cloud governance.',
    price: 84,
  },
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
  try {
    const response = await api.get(`/products?limit=${limit}`)
    const products = Array.isArray(response?.data?.products) ? response.data.products : []

    if (products.length > 0) {
      return products.map(mapProductToApplication).slice(0, limit)
    }
  } catch (error) {
    console.warn('Seed API unavailable. Using local starter data instead.', error)
  }

  return fallbackSeedProducts.map(mapProductToApplication).slice(0, limit)
}

export default api