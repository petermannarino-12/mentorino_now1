import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockNavigate = vi.hoisted(() => vi.fn(() => null));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, Navigate: mockNavigate };
});

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>);

describe('ProtectedRoute', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('redirects to /auth when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, role: 'visitor' });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/auth' }),
      undefined
    );
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'user' });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to / when role is not in allowedRoles', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'user' });
    renderWithRouter(<ProtectedRoute allowedRoles={['admin']}><div>Admin Only</div></ProtectedRoute>);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/' }),
      undefined
    );
  });

  it('renders children when role is in allowedRoles', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin' });
    renderWithRouter(<ProtectedRoute allowedRoles={['admin']}><div>Admin Only</div></ProtectedRoute>);
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
