import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { StatusBadge } from '@/shared/ui/status-badge'

describe('accessible UI primitives', () => {
  it('activates a named button from the keyboard', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Продолжить</Button>)

    await userEvent.setup().tab()
    await userEvent.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Продолжить' })).toHaveFocus()
  })

  it('connects an input to its label and validation message', () => {
    render(<Field label="Телефон" name="phone" error="Введите номер" />)

    expect(screen.getByRole('textbox', { name: 'Телефон' })).toHaveAccessibleDescription(
      'Введите номер',
    )
    expect(screen.getByRole('textbox', { name: 'Телефон' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('describes a medical status with text, not color alone', () => {
    render(<StatusBadge tone="danger">Требует внимания</StatusBadge>)

    expect(screen.getByRole('status')).toHaveTextContent('Требует внимания')
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'danger')
  })
})
