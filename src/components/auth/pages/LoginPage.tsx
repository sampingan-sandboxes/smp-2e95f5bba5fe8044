import type { ReactElement } from 'react';
import { signInWithGoogle } from '@/components/auth/auth';
import { Button } from '@/base/components/ui/button';
import GoogleIcon from '../components/GoogleIcon';

/**
 * YOUR TASK — implement the login page.
 *
 * Render a heading "Playbook" and a Button containing the provided <GoogleIcon /> and the
 * text "Continue with Google". Clicking the button starts `signInWithGoogle()` (fire and
 * forget — it redirects the browser). The Button is `type="button"`.
 */
function LoginPage(): ReactElement {
  void signInWithGoogle;
  void Button;
  void GoogleIcon;
  throw new Error('NotImplemented');
}

export default LoginPage;
