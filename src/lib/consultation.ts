import { site } from './site'

export const spaceOptions = [
  { value: 'home-theatre', label: 'Home theatre', hint: 'Screening room or media lounge' },
  { value: 'studio', label: 'Studio', hint: 'Recording, mixing or podcast' },
  { value: 'workspace', label: 'Workspace', hint: 'Office, meeting room or call pod' },
  { value: 'hospitality', label: 'Hospitality or hall', hint: 'Restaurant, auditorium, worship' },
  { value: 'other', label: 'Something else', hint: "Tell us about it and we'll take a look" },
] as const

export const sizeOptions = ['Under 15 m²', '15–40 m²', '40–100 m²', 'Over 100 m²', 'Not sure'] as const

export const stageOptions = ['Just planning', 'Under construction', 'Existing room'] as const

export const concernOptions = [
  'Echo and ringing',
  'Muddy or boomy bass',
  'Hard to understand speech',
  'Sound leaking in or out',
  'Outside noise',
  'I just want it perfect',
] as const

export const contactOptions = ['Phone call', 'Email', 'WhatsApp'] as const

export type ConsultationData = {
  space: string
  size: string
  stage: string
  concerns: string[]
  name: string
  email: string
  phone: string
  city: string
  contactBy: string
  notes: string
}

export const emptyConsultation: ConsultationData = {
  space: '',
  size: '',
  stage: '',
  concerns: [],
  name: '',
  email: '',
  phone: '',
  city: '',
  contactBy: 'Email',
  notes: '',
}

export type Errors = Partial<Record<keyof ConsultationData, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[+\d][\d\s-]{6,}$/

export function validateStep(step: number, data: ConsultationData): Errors {
  const errors: Errors = {}
  if (step === 0 && !data.space) errors.space = 'Pick the kind of space.'
  if (step === 1) {
    if (!data.size) errors.size = 'Pick an approximate size.'
    if (!data.stage) errors.stage = 'Let us know where the project is.'
  }
  if (step === 2) {
    if (!data.name.trim()) errors.name = 'Please add your name.'
    if (!EMAIL.test(data.email.trim())) errors.email = 'Please add a valid email address.'
    if (data.phone.trim() && !PHONE.test(data.phone.trim())) errors.phone = 'That phone number looks incomplete.'
    if (data.contactBy !== 'Email' && !data.phone.trim()) errors.phone = `Add a number so we can reach you by ${data.contactBy.toLowerCase()}.`
  }
  return errors
}

export const labelFor = (space: string) => spaceOptions.find((o) => o.value === space)?.label ?? space

function summary(data: ConsultationData) {
  return [
    `Space: ${labelFor(data.space)}`,
    `Size: ${data.size}`,
    `Stage: ${data.stage}`,
    `Concerns: ${data.concerns.join(', ') || 'None given'}`,
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || '-'}`,
    `City: ${data.city || '-'}`,
    `Preferred contact: ${data.contactBy}`,
    '',
    data.notes ? `Notes:\n${data.notes}` : '',
  ].join('\n')
}

export type SubmitResult = { kind: 'sent' } | { kind: 'mail'; href: string }

/**
 * Sends the request to VITE_CONSULT_ENDPOINT (any JSON form endpoint, e.g. Formspree) when it is set.
 * Without one, returns a pre-filled email so the visitor can send it themselves.
 */
export async function submitConsultation(data: ConsultationData): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_CONSULT_ENDPOINT as string | undefined

  if (!endpoint) {
    const subject = `Consultation request: ${labelFor(data.space)}`
    const href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary(data))}`
    return { kind: 'mail', href }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...data, space: labelFor(data.space), _subject: 'New consultation request' }),
  })
  if (!response.ok) throw new Error(`Request failed with ${response.status}`)
  return { kind: 'sent' }
}
