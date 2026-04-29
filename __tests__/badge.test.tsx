import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'
import { describe, it, expect } from 'vitest'

describe('Badge Component', () => {
  it('renders correctly with default variant', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-variant', 'default')
  })

  it('renders correctly with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })
})
