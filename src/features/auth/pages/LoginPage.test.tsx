import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from './LoginPage';

const { vendorAccessToken } = vi.hoisted(() => {
  const tokenPayload = btoa(JSON.stringify({ sub: 'vendor-1', email: 'vendor@test.com', role: 'Vendor' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { vendorAccessToken: `header.${tokenPayload}.signature` };
});

vi.mock('../api/authApi', () => ({
  login: vi.fn(async () => ({
    accessToken: vendorAccessToken,
    refreshToken: 'refresh',
    accessTokenExpiration: '2026-06-04T10:00:00Z',
    refreshTokenExpiration: '2026-06-05T10:00:00Z',
  })),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
  });

  it('rejects a token whose role does not match the selected workspace', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText('Workspace'), 'Admin');
    await user.type(screen.getByLabelText('Email'), 'vendor@test.com');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.click(screen.getByRole('button', { name: 'Enter dashboard' }));

    expect(await screen.findByText('This account does not have Admin dashboard access.')).toBeInTheDocument();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
