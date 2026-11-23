import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const KEY = 'mitra-dashboard:session';

function readSession(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeSession(email: string | null) {
  try {
    if (email) window.sessionStorage.setItem(KEY, email);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable, the session just will not survive a reload */
  }
}

/**
 * Two screens only: sign in, then the dashboard. There is no backend. Any email and password
 * are accepted, and the session lives in sessionStorage for the length of the tab.
 */
export default function App() {
  const [user, setUser] = useState<string | null>(() => readSession());

  const signIn = (email: string) => {
    writeSession(email);
    setUser(email);
  };
  const signOut = () => {
    writeSession(null);
    setUser(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={user ? 'dashboard' : 'login'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        {user ? <Dashboard email={user} onSignOut={signOut} /> : <Login onSignedIn={signIn} />}
      </motion.div>
    </AnimatePresence>
  );
}
