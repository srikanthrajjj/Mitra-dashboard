import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, type LucideIcon } from 'lucide-react';
import { Logo } from './Logo';
import { WaveField } from './WaveField';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface LoginProps {
  onSignedIn: (email: string) => void;
}

type Mode = 'signin' | 'forgot' | 'sent' | 'sso';

function Field({
  id,
  label,
  icon: Icon,
  aside,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-medium text-muted-foreground">
          {label}
        </label>
        {aside}
      </div>
      <div className="flex h-11 items-center gap-2.5 rounded-lg border border-border bg-mitra-input px-3 transition-colors focus-within:border-brand-green/70 focus-within:ring-4 focus-within:ring-brand-green/10">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {children}
      </div>
    </div>
  );
}

const INPUT = 'h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground';
const PRIMARY =
  'flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-green text-[14px] font-semibold text-background transition-colors hover:bg-brand-green-hover disabled:opacity-70';

export function Login({ onSignedIn }: LoginProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const finish = (who: string) => {
    setBusy(true);
    window.setTimeout(() => onSignedIn(who), 1100);
  };

  const submitSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    setError('');
    finish(email.trim());
  };

  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter the email address for your account.');
      return;
    }
    setError('');
    setMode('sent');
  };

  const startSso = () => {
    setMode('sso');
    window.setTimeout(() => onSignedIn(email.trim() || 'alex.morgan@acme.com'), 1600);
  };

  const back = () => {
    setMode('signin');
    setError('');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <WaveField />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative w-full max-w-[24rem] rounded-2xl border border-mitra-border bg-mitra-surface/95 p-7 backdrop-blur-xl"
      >
        <Logo className="h-[24px] w-auto" />

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'signin' && (
            <motion.form
              key="signin"
              onSubmit={submitSignIn}
              noValidate
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <h1 className="mt-7 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.03em]">Sign in</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">Welcome back. Pick up where your agents left off.</p>

              <div className="mt-6 space-y-4">
                <Field id="email" label="Work email" icon={Mail}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field
                  id="password"
                  label="Password"
                  icon={Lock}
                  aside={
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                      }}
                      className="text-[12px] text-brand-green transition-colors hover:text-brand-green-hover"
                    >
                      Forgot password?
                    </button>
                  }
                >
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={INPUT}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>
              </div>

              {error && (
                <p role="alert" className="mt-3 text-[12.5px] text-foreground">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-green align-middle" />
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className={cn(PRIMARY, 'mt-6')}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={startSso}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-[14px] font-medium transition-colors hover:bg-accent"
              >
                <KeyRound className="h-4 w-4 text-brand-green" aria-hidden /> Continue with SSO
              </button>
              <p className="mt-5 text-center text-[11px] text-muted-foreground">
                Protected by your organisation&apos;s identity provider
              </p>
            </motion.form>
          )}

          {mode === 'forgot' && (
            <motion.form
              key="forgot"
              onSubmit={submitReset}
              noValidate
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <h1 className="mt-7 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.03em]">Reset your password</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Enter the email for your account and we will send you a link to choose a new password.
              </p>
              <div className="mt-6">
                <Field id="reset-email" label="Work email" icon={Mail}>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT}
                  />
                </Field>
              </div>
              {error && (
                <p role="alert" className="mt-3 text-[12.5px] text-foreground">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-green align-middle" />
                  {error}
                </p>
              )}
              <button type="submit" className={cn(PRIMARY, 'mt-6')}>
                Send reset link
              </button>
              <button
                type="button"
                onClick={back}
                className="mx-auto mt-5 flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to sign in
              </button>
            </motion.form>
          )}

          {mode === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <h1 className="mt-7 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.03em]">Check your inbox</h1>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                If an account exists for <span className="text-foreground">{email.trim()}</span>, a reset link is on its way.
                It can take a minute to arrive.
              </p>
              <button type="button" onClick={back} className={cn(PRIMARY, 'mt-6')}>
                Back to sign in
              </button>
            </motion.div>
          )}

          {mode === 'sso' && (
            <motion.div
              key="sso"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="py-10 text-center"
            >
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-green" aria-hidden />
              <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">Redirecting to your identity provider</p>
              <p className="mt-1 text-[13px] text-muted-foreground">You will be signed in automatically.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
