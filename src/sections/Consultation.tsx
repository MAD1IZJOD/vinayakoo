import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  concernOptions,
  contactOptions,
  emptyConsultation,
  labelFor,
  sizeOptions,
  spaceOptions,
  stageOptions,
  submitConsultation,
  validateStep,
  type ConsultationData,
  type Errors,
} from '../lib/consultation'
import { site } from '../lib/site'
import './Consultation.css'

const STEPS = ['Your space', 'The room', 'About you', 'Review']

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'mail'; href: string } | { kind: 'error' }

function ErrorText({ id, children }: { id: string; children?: string }) {
  return children ? (
    <p className="consult-error" id={id} role="alert">
      {children}
    </p>
  ) : null
}

function Choice({
  type,
  name,
  checked,
  onChange,
  children,
}: {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label className={`consult-choice${checked ? ' is-checked' : ''}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

export function Consultation() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ConsultationData>(emptyConsultation)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const heading = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  // move focus to the step title after navigating, so keyboard and screen reader users keep their place
  useEffect(() => {
    if (moved.current) heading.current?.focus()
  }, [step, status.kind])

  const set = <K extends keyof ConsultationData>(key: K, value: ConsultationData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleConcern = (concern: string) =>
    set('concerns', data.concerns.includes(concern) ? data.concerns.filter((c) => c !== concern) : [...data.concerns, concern])

  const next = () => {
    const found = validateStep(step, data)
    setErrors(found)
    if (Object.keys(found).length) return
    moved.current = true
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => {
    moved.current = true
    setStep((s) => Math.max(s - 1, 0))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < STEPS.length - 1) return next()
    setStatus({ kind: 'sending' })
    try {
      const result = await submitConsultation(data)
      moved.current = true
      if (result.kind === 'mail') window.location.href = result.href
      setStatus(result)
    } catch {
      setStatus({ kind: 'error' })
    }
  }

  const restart = () => {
    setData(emptyConsultation)
    setStep(0)
    setStatus({ kind: 'idle' })
  }

  const field = (key: keyof ConsultationData) => ({
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? `err-${key}` : undefined,
  })

  const done = status.kind === 'sent' || status.kind === 'mail'

  return (
    <section className="section consult" id="consult">
      <div className="container consult-layout">
        <div className="section-head consult-intro">
          <p className="eyebrow" data-reveal>Consultation</p>
          <h2 data-split>Tell us about your room.</h2>
          <p data-reveal>
            Two minutes of questions helps us come to the first conversation prepared. We&apos;ll get back to you
            within two working days to arrange a visit or a video call.
          </p>
          <p className="consult-direct">
            Prefer to talk? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>

        <div className="consult-card" data-reveal>
          {done ? (
            <div className="consult-done">
              <span className="consult-done-mark" aria-hidden="true" />
              <h3 ref={heading} tabIndex={-1}>
                {status.kind === 'sent' ? 'Thank you, we have your details.' : 'Almost there.'}
              </h3>
              {status.kind === 'sent' ? (
                <p>
                  We&apos;ll be in touch by {data.contactBy.toLowerCase()} within two working days to talk about your{' '}
                  {labelFor(data.space).toLowerCase()}.
                </p>
              ) : (
                <p>
                  Your email app should have opened with everything filled in. Just press send. If it didn&apos;t open,{' '}
                  <a href={status.href}>open the email again</a> or write to us at{' '}
                  <a href={`mailto:${site.email}`}>{site.email}</a>.
                </p>
              )}
              <button type="button" className="btn" onClick={restart}>
                Start another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <ol className="consult-progress" aria-label="Progress">
                {STEPS.map((label, i) => (
                  <li
                    key={label}
                    className={i === step ? 'is-current' : i < step ? 'is-done' : undefined}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    <span>{label}</span>
                  </li>
                ))}
              </ol>

              <h3 ref={heading} tabIndex={-1} className="consult-step-title">
                <span className="visually-hidden">
                  Step {step + 1} of {STEPS.length}:{' '}
                </span>
                {['What kind of space is it?', 'Tell us about the room.', 'How can we reach you?', 'Does this look right?'][step]}
              </h3>

              {step === 0 && (
                <fieldset className="consult-fieldset" {...field('space')}>
                  <legend className="visually-hidden">Kind of space</legend>
                  <div className="consult-spaces">
                    {spaceOptions.map((option) => (
                      <Choice
                        key={option.value}
                        type="radio"
                        name="space"
                        checked={data.space === option.value}
                        onChange={() => set('space', option.value)}
                      >
                        <strong>{option.label}</strong>
                        <small>{option.hint}</small>
                      </Choice>
                    ))}
                  </div>
                  <ErrorText id="err-space">{errors.space}</ErrorText>
                </fieldset>
              )}

              {step === 1 && (
                <>
                  <fieldset className="consult-fieldset" {...field('size')}>
                    <legend>Approximate size</legend>
                    <div className="consult-chips">
                      {sizeOptions.map((size) => (
                        <Choice key={size} type="radio" name="size" checked={data.size === size} onChange={() => set('size', size)}>
                          {size}
                        </Choice>
                      ))}
                    </div>
                    <ErrorText id="err-size">{errors.size}</ErrorText>
                  </fieldset>

                  <fieldset className="consult-fieldset" {...field('stage')}>
                    <legend>Where is the project?</legend>
                    <div className="consult-chips">
                      {stageOptions.map((stage) => (
                        <Choice key={stage} type="radio" name="stage" checked={data.stage === stage} onChange={() => set('stage', stage)}>
                          {stage}
                        </Choice>
                      ))}
                    </div>
                    <ErrorText id="err-stage">{errors.stage}</ErrorText>
                  </fieldset>

                  <fieldset className="consult-fieldset">
                    <legend>
                      What would you like to fix? <span className="consult-optional">Choose any</span>
                    </legend>
                    <div className="consult-chips">
                      {concernOptions.map((concern) => (
                        <Choice
                          key={concern}
                          type="checkbox"
                          name="concerns"
                          checked={data.concerns.includes(concern)}
                          onChange={() => toggleConcern(concern)}
                        >
                          {concern}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {step === 2 && (
                <div className="consult-fields">
                  <label className="consult-field">
                    <span>Name</span>
                    <input
                      value={data.name}
                      onChange={(e) => set('name', e.target.value)}
                      autoComplete="name"
                      {...field('name')}
                    />
                    <ErrorText id="err-name">{errors.name}</ErrorText>
                  </label>
                  <label className="consult-field">
                    <span>Email</span>
                    <input
                      type="email"
                      inputMode="email"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                      {...field('email')}
                    />
                    <ErrorText id="err-email">{errors.email}</ErrorText>
                  </label>
                  <label className="consult-field">
                    <span>
                      Phone <span className="consult-optional">Optional</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      autoComplete="tel"
                      {...field('phone')}
                    />
                    <ErrorText id="err-phone">{errors.phone}</ErrorText>
                  </label>
                  <label className="consult-field">
                    <span>
                      City <span className="consult-optional">Optional</span>
                    </span>
                    <input value={data.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" />
                  </label>

                  <fieldset className="consult-fieldset consult-wide">
                    <legend>Best way to reach you</legend>
                    <div className="consult-chips">
                      {contactOptions.map((option) => (
                        <Choice
                          key={option}
                          type="radio"
                          name="contactBy"
                          checked={data.contactBy === option}
                          onChange={() => set('contactBy', option)}
                        >
                          {option}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>

                  <label className="consult-field consult-wide">
                    <span>
                      Anything else? <span className="consult-optional">Optional</span>
                    </span>
                    <textarea
                      rows={4}
                      value={data.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      placeholder="Room dimensions, equipment, timelines, what you love or hate about it now…"
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <dl className="consult-review">
                  {[
                    ['Space', labelFor(data.space), 0],
                    ['Size', data.size, 1],
                    ['Stage', data.stage, 1],
                    ['To fix', data.concerns.join(', ') || 'Not specified', 1],
                    ['Name', data.name, 2],
                    ['Email', data.email, 2],
                    ['Phone', data.phone || 'Not given', 2],
                    ['City', data.city || 'Not given', 2],
                    ['Contact by', data.contactBy, 2],
                    ...(data.notes ? [['Notes', data.notes, 2] as const] : []),
                  ].map(([term, value, editStep]) => (
                    <div key={term as string}>
                      <dt>{term}</dt>
                      <dd>{value}</dd>
                      <button
                        type="button"
                        className="consult-edit"
                        onClick={() => {
                          moved.current = true
                          setStep(editStep as number)
                        }}
                      >
                        Edit<span className="visually-hidden"> {term}</span>
                      </button>
                    </div>
                  ))}
                </dl>
              )}

              {status.kind === 'error' && (
                <p className="consult-error consult-submit-error" role="alert">
                  Something went wrong sending your request. Please try again, or email us at{' '}
                  <a href={`mailto:${site.email}`}>{site.email}</a>.
                </p>
              )}

              <div className="consult-actions">
                {step > 0 && (
                  <button type="button" className="btn" onClick={back}>
                    Back
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={status.kind === 'sending'}>
                  {step < STEPS.length - 1 ? 'Continue' : status.kind === 'sending' ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
