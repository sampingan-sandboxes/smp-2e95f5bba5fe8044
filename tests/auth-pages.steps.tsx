// Provided acceptance suite — do not modify.
// Executes docs/features/auth-pages.feature against your pages.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect, vi, beforeEach } from 'vitest';
import { StrictMode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StoredTokens } from '../src/components/auth/tokenStorage';

const mockSignIn = vi.fn<() => Promise<void>>();
const mockHandleCallback = vi.fn<(url: string) => Promise<StoredTokens>>();

vi.mock('../src/components/auth/auth', () => ({
  signInWithGoogle: mockSignIn,
  handleAuthCallback: mockHandleCallback,
}));

// Imported AFTER vi.mock so the pages pick up the mocked auth module.
const { default: LoginPage } = await import('../src/components/auth/pages/LoginPage');
const { default: AuthCallbackPage } = await import('../src/components/auth/pages/AuthCallbackPage');

const feature = loadFeature('docs/features/auth-pages.feature');

const onSignedIn = vi.fn<(tokens: StoredTokens) => void>();

beforeEach(() => {
  mockSignIn.mockReset().mockResolvedValue();
  mockHandleCallback.mockReset();
  onSignedIn.mockReset();
});

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

function renderCallback() {
  render(
    <StrictMode>
      <MemoryRouter initialEntries={['/auth/callback?code=abc&state=s-1']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage onSignedIn={onSignedIn} />} />
          <Route path="/" element={<div>HOME ROUTE</div>} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  );
}

defineFeature(feature, (test) => {
  test('The login page renders the Google sign-in button', ({ when, then, and }) => {
    when('the login page is rendered', () => {
      renderLogin();
    });
    then(/^the heading "([^"]*)" is shown$/, (heading) => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    });
    and(/^a button labelled "([^"]*)" is shown$/, (label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  test('Clicking the login button starts sign-in', ({ when, and, then }) => {
    when('the login page is rendered', () => {
      renderLogin();
    });
    and(/^the "([^"]*)" button is clicked$/, async (label) => {
      await userEvent.click(screen.getByRole('button', { name: label }));
    });
    then('sign-in with Google was started', () => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  test('The callback page completes sign-in and routes home', ({ given, when, then, and }) => {
    given(/^the callback will succeed with id token "([^"]*)"$/, (idToken) => {
      mockHandleCallback.mockResolvedValue({ idToken, accessToken: 'ac-1', expiresAt: Date.now() + 3600_000 });
    });
    when('the callback page is rendered', () => {
      renderCallback();
    });
    then('the signed-in handler receives the tokens', async () => {
      await screen.findByText('HOME ROUTE');
      expect(onSignedIn).toHaveBeenCalledTimes(1);
      expect(onSignedIn.mock.calls[0][0].idToken).toBe('id-1');
    });
    and(/^the app navigates to "([^"]*)"$/, async () => {
      expect(await screen.findByText('HOME ROUTE')).toBeInTheDocument();
    });
  });

  test('The callback page shows an error when sign-in fails', ({ given, when, then }) => {
    given(/^the callback will fail with "([^"]*)"$/, (message) => {
      mockHandleCallback.mockRejectedValue(new Error(message));
    });
    when('the callback page is rendered', () => {
      renderCallback();
    });
    then(/^the page shows "([^"]*)"$/, async (text) => {
      expect(await screen.findByText(text)).toBeInTheDocument();
    });
  });

  test('The callback runs the exchange only once', ({ given, when, then }) => {
    given(/^the callback will succeed with id token "([^"]*)"$/, (idToken) => {
      mockHandleCallback.mockResolvedValue({ idToken, accessToken: 'ac-1', expiresAt: Date.now() + 3600_000 });
    });
    when('the callback page is rendered', () => {
      renderCallback();
    });
    then('the callback handler ran exactly once', async () => {
      await screen.findByText('HOME ROUTE');
      expect(mockHandleCallback).toHaveBeenCalledTimes(1);
    });
  });
});
