import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Sparkles, type LucideIcon } from 'lucide-react';
import { Logo } from './Logo';
import { WaveCanvas } from './WaveCanvas';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const DEMO_EMAIL = 'alex.morgan@acme.com';
const WORKSPACES = ['ITSM', 'ITOM', 'ITAM', 'HRSD', 'CSM', 'SecOps'];

interface LoginProps {
  onSignedIn: (email: string) => void;
}

type Mode = 'signin' | 'forgot' | 'sent' | 'sso' | 'demo';

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
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
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
const BUTTON = 'flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold transition-colors disabled:opacity-70';
const PRIMARY = cn(BUTTON, 'bg-brand-green text-background hover:bg-brand-green-hover');
const OUTLINE = cn(BUTTON, 'border border-border font-medium text-foreground hover:bg-accent');

function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-3 text-[12.5px] text-foreground">
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-green align-middle" />
      {children}
    </p>
  );
}

export function Login({ onSignedIn }: LoginProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submitSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    setError('');
    setBusy(true);
    window.setTimeout(() => onSignedIn(email.trim()), 1000);
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
    window.setTimeout(() => onSignedIn(email.trim() || DEMO_EMAIL), 1500);
  };

  /** One click, no credentials. */
  const startDemo = () => {
    setMode('demo');
    window.setTimeout(() => onSignedIn(DEMO_EMAIL), 900);
  };

  const back = () => {
    setMode('signin');
    setError('');
  };

  const heading = 'mt-8 font-display text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]';

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.08fr_1fr]">
      {/* left: wave visual */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-mitra-sidebar lg:block">
        <WaveCanvas className="absolute inset-0 h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 30% 55%, color-mix(in srgb, var(--color-brand-green) 14%, transparent), transparent 70%), linear-gradient(to top, #181818 4%, transparent 46%), linear-gradient(to bottom, #181818 0%, transparent 22%)',
          }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo className="h-[26px] w-auto self-start" />
          <div>
            <h2 className="max-w-[16ch] font-display text-[clamp(2.2rem,3.6vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
              Your agents build. <span className="text-brand-green">You approve.</span>
            </h2>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">
              One workspace for every ServiceNow delivery, with a person signing off at each stage.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Workspaces">
              {WORKSPACES.map((w) => (
                <li key={w} className="rounded-full border border-mitra-border bg-background/40 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* right: sign in */}
      <main className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        <WaveCanvas className="absolute inset-0 h-full w-full opacity-25 lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-full max-w-[24rem]"
        >
          <Logo className="h-[24px] w-auto lg:hidden" />

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
                <h1 className={cn(heading, 'lg:mt-0')}>Welcome back</h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">Sign in to pick up where your agents left off.</p>

                <button type="button" onClick={startDemo} className={cn(PRIMARY, 'mt-7')}>
                  <Sparkles className="h-4 w-4" aria-hidden /> Continue as demo user
                </button>
                <p className="mt-2 text-center text-[12px] text-muted-foreground">One click. No credentials needed.</p>

                <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or sign in
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4">
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
                        className="text-[12.5px] text-brand-green transition-colors hover:text-brand-green-hover"
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

                {error && <Notice>{error}</Notice>}

                <button type="submit" disabled={busy} className={cn(OUTLINE, 'mt-5')}>
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
                <button type="button" onClick={startSso} className={cn(OUTLINE, 'mt-3')}>
                  <KeyRound className="h-4 w-4 text-brand-green" aria-hidden /> Continue with SSO
                </button>
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
                <h1 className={cn(heading, 'lg:mt-0')}>Reset your password</h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  Enter the email for your account and we will send you a link to choose a new password.
                </p>
                <div className="mt-7">
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
                {error && <Notice>{error}</Notice>}
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
                <h1 className={cn(heading, 'lg:mt-0')}>Check your inbox</h1>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  If an account exists for <span className="text-foreground">{email.trim()}</span>, a reset link is on its way. It can
                  take a minute to arrive.
                </p>
                <button type="button" onClick={back} className={cn(PRIMARY, 'mt-7')}>
                  Back to sign in
                </button>
              </motion.div>
            )}

            {(mode === 'sso' || mode === 'demo') && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="py-16 text-center"
              >
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-green" aria-hidden />
                <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">
                  {mode === 'sso' ? 'Redirecting to your identity provider' : 'Opening the demo workspace'}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {mode === 'sso' ? 'You will be signed in automatically.' : 'Signing you in as Alex Morgan.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-[11.5px] text-muted-foreground">Protected by your organisation&apos;s identity provider</p>
        </motion.div>
      </main>
    </div>
  );
}
