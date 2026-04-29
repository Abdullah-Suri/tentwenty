import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/header'
import { describe, it, expect } from 'vitest'

describe('Header Component', () => {
  it('renders the brand name', () => {
    render(<Header />)
    expect(screen.getByText('ticktock')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Timesheets')).toBeInTheDocument()
  })

  it('displays the user name from session', () => {
    render(<Header />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})