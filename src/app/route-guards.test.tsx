import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RequireAuth } from './route-guards';

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiration: null,
      refreshTokenExpiration: null,
      user: null,
      hasHydrated: true,
    });
  });

  it('redirects unauthenticated users to login', () => {
    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route
            path="/admin/users"
            element={
              <RequireAuth roles={['Admin']}>
                <p>Protected</p>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<p>Login screen</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login screen')).toBeInTheDocument();
  });
});
