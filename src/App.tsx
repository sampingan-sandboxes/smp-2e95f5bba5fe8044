// Provided dev harness — do not modify.
//
// A minimal router that wires up ONLY the auth module's pages so `npm run dev` boots.
// The real app has many more routes; here, "/" is a placeholder that reflects whether a
// session is currently active.
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ensureValidTokens, getCurrentUser, signOut } from '@/components/auth/auth';
import type { StoredTokens } from '@/components/auth/tokenStorage';
import { decodeIdToken } from '@/components/auth/idToken';
import LoginPage from '@/components/auth/pages/LoginPage';
import AuthCallbackPage from '@/components/auth/pages/AuthCallbackPage';

function HomePlaceholder({ user }: { user: StoredTokens | null }) {
  if (!user) return <Navigate to="/login" replace />;
  const claims = decodeIdToken(user.idToken);
  return (
    <main style={{ padding: 40 }}>
      <h1>Signed in as {claims.name ?? claims.email ?? 'unknown'}</h1>
      <p><Link to="/login">Back to login</Link></p>
      <button onClick={() => signOut()}>Sign out</button>
    </main>
  );
}

function App() {
  const [user, setUser] = useState<StoredTokens | null>(getCurrentUser);

  useEffect(() => {
    ensureValidTokens().then(setUser);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage onSignedIn={setUser} />} />
      <Route path="/" element={<HomePlaceholder user={user} />} />
    </Routes>
  );
}

export default App;
