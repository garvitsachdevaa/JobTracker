import { useMemo } from 'react'

const TECH_KEYWORDS = [
  'react',
  'javascript',
  'typescript',
  'node',
  'express',
  'nextjs',
  'redux',
  'graphql',
  'rest',
  'api',
  'sql',
  'mongodb',
  'postgres',
  'aws',
  'docker',
  'kubernetes',
  'testing',
  'jest',
  'cypress',
  'tailwind',
  'html',
  'css',
  'figma',
  'agile',
]

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'your',
  'from',
  'have',
  'will',
  'you',
  'our',
  'team',
  'role',
  'job',
  'work',
  'using',
  'into',
  'able',
  'are',
])

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean)
}

function unique(values) {
  return [...new Set(values)]
}

function isUsefulKeyword(keyword) {
  return keyword.length > 2 && !STOP_WORDS.has(keyword)
}

export default function useJobFitScore(jobDescription, applicationData = {}) {
  return useMemo(() => {
    const descriptionTokens = tokenize(jobDescription)
    const descriptionSet = new Set(descriptionTokens)

    if (descriptionSet.size === 0) {
      return {
        score: 0,
        matched: [],
        missing: [],
      }
    }

    const contextTokens = tokenize(
      [
        applicationData.role,
        applicationData.company,
        applicationData.notes,
        Array.isArray(applicationData.tags) ? applicationData.tags.join(' ') : '',
      ]
        .filter(Boolean)
        .join(' '),
    )
      .filter(isUsefulKeyword)
      .slice(0, 18)

    const extractedTechKeywords = TECH_KEYWORDS.filter((keyword) => descriptionSet.has(keyword))

    const targetKeywords = unique([...contextTokens, ...extractedTechKeywords]).slice(0, 22)

    if (targetKeywords.length === 0) {
      return {
        score: 0,
        matched: [],
        missing: [],
      }
    }

    const matched = targetKeywords.filter((keyword) => descriptionSet.has(keyword))
    const missing = contextTokens.filter((keyword) => !descriptionSet.has(keyword))
    const score = Math.min(100, Math.round((matched.length / targetKeywords.length) * 100))

    return {
      score,
      matched,
      missing,
    }
  }, [
    applicationData.company,
    applicationData.notes,
    applicationData.role,
    applicationData.tags,
    jobDescription,
  ])
}