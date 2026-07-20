import { useId, type InputHTMLAttributes } from 'react'

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function Field({ label, hint, error, id, className = '', ...props }: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={inputId}>
        {label}
        {props.required ? <span className="field__required"> *</span> : null}
      </label>
      <input
        {...props}
        aria-describedby={hint || error ? descriptionId : undefined}
        aria-invalid={error ? true : undefined}
        className="field__control"
        id={inputId}
      />
      {error ? (
        <span className="field__message field__message--error" id={descriptionId} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field__message" id={descriptionId}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
