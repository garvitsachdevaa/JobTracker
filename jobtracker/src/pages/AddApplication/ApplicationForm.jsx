import { yupResolver } from '@hookform/resolvers/yup'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import useJobFitScore from '../../hooks/useJobFitScore'
import {
  APP_STATUS_OPTIONS,
  CURRENCY_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  ROUTES,
} from '../../utils/constants'

const numberField = yup
  .number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || typeof originalValue === 'undefined') {
      return null
    }

    return Number.isNaN(value) ? null : value
  })
  .nullable()

const dateField = yup
  .date()
  .transform((value, originalValue) => {
    if (!originalValue) {
      return null
    }

    const parsedValue = new Date(originalValue)
    return Number.isNaN(parsedValue.getTime()) ? null : parsedValue
  })
  .nullable()

const validationSchema = yup.object({
  company: yup.string().trim().required('Company name is required'),
  role: yup.string().trim().required('Job role is required'),
  location: yup.string().trim(),
  locationType: yup.string().oneOf(LOCATION_TYPE_OPTIONS).required('Location type is required'),
  salary: numberField.positive('Salary must be a positive value'),
  salaryMax: numberField.min(yup.ref('salary'), 'Max must be ≥ min'),
  currency: yup.string().oneOf(CURRENCY_OPTIONS).required('Currency is required'),
  platform: yup.string().oneOf(PLATFORM_OPTIONS).required('Platform is required'),
  status: yup.string().oneOf(APP_STATUS_OPTIONS).required('Status is required'),
  appliedDate: dateField.required('Applied date is required'),
  interviewDate: dateField.when(['status', 'appliedDate'], {
    is: (status, appliedDate) => status && status !== 'Applied' && Boolean(appliedDate),
    then: (schema) => schema.min(yup.ref('appliedDate'), 'Must be after applied date'),
    otherwise: (schema) => schema.nullable(),
  }),
  followUpDate: dateField,
  resumeVersion: yup.string().trim(),
  notes: yup.string(),
  tags: yup.array().of(yup.string().trim()),
})

function toDateInputValue(value) {
  if (!value) {
    return ''
  }

  const parsedValue = new Date(value)
  if (Number.isNaN(parsedValue.getTime())) {
    return ''
  }

  return parsedValue.toISOString().slice(0, 10)
}

function scoreStrokeColor(score) {
  if (score < 40) {
    return '#f43f5e'
  }

  if (score < 70) {
    return '#f59e0b'
  }

  return '#10b981'
}

function scoreLabel(score) {
  if (score < 40) {
    return 'Needs Work'
  }

  if (score < 70) {
    return 'Moderate Fit'
  }

  return 'Strong Fit'
}

function FitScoreGauge({ score }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const strokeDashoffset = circumference - progress

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" fill="transparent" r={radius} stroke="#cbd5e1" strokeWidth="12" />
        <motion.circle
          animate={{ strokeDashoffset }}
          cx="70"
          cy="70"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          r={radius}
          stroke={scoreStrokeColor(score)}
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth="12"
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{score}</p>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {scoreLabel(score)}
        </p>
      </div>
    </div>
  )
}

function KeywordPills({ keywords, type }) {
  if (keywords.length === 0) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {type === 'matched' ? 'No matched keywords yet.' : 'No missing keywords from your profile context.'}
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <span
          className={[
            'rounded-full border px-2.5 py-1 text-xs font-medium',
            type === 'matched'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-300',
          ].join(' ')}
          key={`${type}-${keyword}`}
        >
          {keyword}
        </span>
      ))}
    </div>
  )
}
function toIsoDateString(value) {
  if (!value) {
    return null
  }

  return new Date(`${value}T00:00:00`).toISOString()
}

function fieldClassName(hasError) {
  return [
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150',
    hasError
      ? 'border-rose-400 focus:border-rose-500'
      : 'border-slate-200 focus:border-indigo-400 dark:border-slate-700 dark:focus:border-indigo-400',
    'dark:bg-slate-900 dark:text-slate-100',
  ].join(' ')
}

function FieldError({ error }) {
  if (!error) {
    return null
  }

  return <p className="mt-1 text-xs font-medium text-rose-500">{error.message}</p>
}

function LocationTypePills({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LOCATION_TYPE_OPTIONS.map((locationType) => {
        const isActive = value === locationType

        return (
          <button
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150',
              isActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            ].join(' ')}
            key={locationType}
            onClick={() => onChange(locationType)}
            type="button"
          >
            {locationType}
          </button>
        )
      })}
    </div>
  )
}

export default function ApplicationForm({
  initialData,
  mode,
  onCancel,
  onSubmitForm,
  submitLabel,
}) {
  const [tagInput, setTagInput] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const defaultValues = useMemo(
    () => ({
      company: initialData?.company || '',
      role: initialData?.role || '',
      location: initialData?.location || '',
      locationType: initialData?.locationType || 'Remote',
      salary: initialData?.salary ?? '',
      salaryMax: initialData?.salaryMax ?? '',
      currency: initialData?.currency || 'USD',
      platform: initialData?.platform || 'LinkedIn',
      status: initialData?.status || 'Applied',
      appliedDate: toDateInputValue(initialData?.appliedDate),
      interviewDate: toDateInputValue(initialData?.interviewDate),
      followUpDate: toDateInputValue(initialData?.followUpDate),
      resumeVersion: initialData?.resumeVersion || '',
      notes: initialData?.notes || '',
      tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
    }),
    [initialData],
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
  })

  useEffect(() => {
    register('locationType')
    register('tags')
  }, [register])

  useEffect(() => {
    reset(defaultValues)
    setTagInput('')
    setJobDescription('')
  }, [defaultValues, reset])

  const selectedStatus = watch('status')
  const selectedLocationType = watch('locationType')
  const watchedCompany = watch('company')
  const watchedRole = watch('role')
  const watchedNotes = watch('notes')
  const tags = watch('tags') || []

  const { score, matched, missing } = useJobFitScore(jobDescription, {
    company: watchedCompany,
    role: watchedRole,
    notes: watchedNotes,
    tags,
  })

  useEffect(() => {
    if (selectedStatus === 'Applied') {
      setValue('interviewDate', '')
    }
  }, [selectedStatus, setValue])

  function addTagFromInput() {
    const nextTags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (nextTags.length === 0) {
      return
    }

    const mergedTags = [...new Set([...tags, ...nextTags])]
    setValue('tags', mergedTags, { shouldValidate: true })
    setTagInput('')
  }

  function removeTag(tagToRemove) {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setValue('tags', updatedTags, { shouldValidate: true })
  }

  function handleTagKeyDown(event) {
    if (event.key === ',' || event.key === 'Enter') {
      event.preventDefault()
      addTagFromInput()
    }
  }

  async function submit(values) {
    const normalizedValues = {
      ...values,
      company: values.company.trim(),
      role: values.role.trim(),
      location: values.location?.trim() || '',
      salary: values.salary === '' || values.salary === null ? null : Number(values.salary),
      salaryMax: values.salaryMax === '' || values.salaryMax === null ? null : Number(values.salaryMax),
      appliedDate: toIsoDateString(values.appliedDate),
      interviewDate: values.interviewDate ? toIsoDateString(values.interviewDate) : null,
      followUpDate: values.followUpDate ? toIsoDateString(values.followUpDate) : null,
      notes: values.notes?.trim() || '',
      tags,
      fitScore: score,
      bookmarked: initialData?.bookmarked ?? false,
    }

    await onSubmitForm(normalizedValues)
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Applications</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {mode === 'edit' ? 'Edit Application' : 'Add Application'}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Capture role details, timeline, and notes to keep your job search organized.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="company">
              Company Name
            </label>
            <input className={fieldClassName(Boolean(errors.company))} id="company" type="text" {...register('company')} />
            <FieldError error={errors.company} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="role">
              Job Role
            </label>
            <input className={fieldClassName(Boolean(errors.role))} id="role" type="text" {...register('role')} />
            <FieldError error={errors.role} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="location">
              Location
            </label>
            <input className={fieldClassName(Boolean(errors.location))} id="location" type="text" {...register('location')} />
            <FieldError error={errors.location} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Location Type</p>
            <div className="mt-2">
              <LocationTypePills
                onChange={(locationType) => setValue('locationType', locationType, { shouldValidate: true })}
                value={selectedLocationType}
              />
            </div>
            <FieldError error={errors.locationType} />
          </div>

          <div className="lg:col-span-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Salary Range</p>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <div>
                <input
                  className={fieldClassName(Boolean(errors.salary))}
                  placeholder="Min salary"
                  type="number"
                  {...register('salary')}
                />
                <FieldError error={errors.salary} />
              </div>
              <div>
                <input
                  className={fieldClassName(Boolean(errors.salaryMax))}
                  placeholder="Max salary"
                  type="number"
                  {...register('salaryMax')}
                />
                <FieldError error={errors.salaryMax} />
              </div>
              <div>
                <select className={fieldClassName(Boolean(errors.currency))} {...register('currency')}>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                <FieldError error={errors.currency} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="platform">
              Platform
            </label>
            <select className={fieldClassName(Boolean(errors.platform))} id="platform" {...register('platform')}>
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <FieldError error={errors.platform} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="status">
              Status
            </label>
            <select className={fieldClassName(Boolean(errors.status))} id="status" {...register('status')}>
              {APP_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FieldError error={errors.status} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="appliedDate">
              Applied Date
            </label>
            <input
              className={fieldClassName(Boolean(errors.appliedDate))}
              id="appliedDate"
              type="date"
              {...register('appliedDate')}
            />
            <FieldError error={errors.appliedDate} />
          </div>

          {selectedStatus !== 'Applied' ? (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="interviewDate">
                Interview Date
              </label>
              <input
                className={fieldClassName(Boolean(errors.interviewDate))}
                id="interviewDate"
                type="date"
                {...register('interviewDate')}
              />
              <FieldError error={errors.interviewDate} />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="followUpDate">
              Follow-up Date
            </label>
            <input
              className={fieldClassName(Boolean(errors.followUpDate))}
              id="followUpDate"
              type="date"
              {...register('followUpDate')}
            />
            <FieldError error={errors.followUpDate} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="resumeVersion">
              Resume Version
            </label>
            <input
              className={fieldClassName(Boolean(errors.resumeVersion))}
              id="resumeVersion"
              placeholder="v3-senior-fe"
              type="text"
              {...register('resumeVersion')}
            />
            <FieldError error={errors.resumeVersion} />
          </div>

          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="tagsInput">
              Tags
            </label>
            <div className="mt-2 flex gap-2">
              <input
                className={fieldClassName(false)}
                id="tagsInput"
                onBlur={addTagFromInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tags and press comma"
                type="text"
                value={tagInput}
              />
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
                onClick={addTagFromInput}
                type="button"
              >
                Add
              </button>
            </div>

            {tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors duration-150 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-500/50"
                    key={tag}
                    onClick={() => removeTag(tag)}
                    type="button"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            ) : null}
            <FieldError error={errors.tags} />
          </div>

          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="notes">
              Notes
            </label>
            <textarea
              className={fieldClassName(Boolean(errors.notes))}
              id="notes"
              placeholder="Add context about the role, hiring manager, or interview prep"
              rows={4}
              {...register('notes')}
            />
            <FieldError error={errors.notes} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Job Fit Score</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Paste a job description snippet to estimate fit based on your role, company context, notes, and tags.
            </p>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="jobDescription">
                Job Description Snippet
              </label>
              <textarea
                className={fieldClassName(false)}
                id="jobDescription"
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste responsibilities and required skills here..."
                rows={5}
                value={jobDescription}
              />
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-[200px,1fr] md:items-center">
              <FitScoreGauge score={score} />

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Matched Keywords
                  </p>
                  <div className="mt-2">
                    <KeywordPills keywords={matched} type="matched" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Missing Keywords
                  </p>
                  <div className="mt-2">
                    <KeywordPills keywords={missing.slice(0, 12)} type="missing" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <button
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {submitLabel}
          </button>
          <button
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <Link className="text-sm text-slate-500 underline-offset-2 hover:underline" to={ROUTES.applications}>
            Back to applications
          </Link>
        </div>
      </form>
    </section>
  )
}