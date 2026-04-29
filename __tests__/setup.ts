import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({
    id: 'test-id',
  }),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock goey-toast
vi.mock('goey-toast', () => ({
  goeyToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
