import type { Answer } from './ask';

export interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  answer?: Answer;
  /** True until the answer has finished revealing, so it only animates once. */
  fresh?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Msg[];
  at: number;
}

const KEY = 'mitra-dashboard:chats';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const titleFrom = (text: string): string => {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 42 ? `${t.slice(0, 41)}…` : t;
};

/** Chats live in sessionStorage, so they survive a reload but not a new tab. Empty chats are never saved. */
export function readChats(): Chat[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Chat[]) : [];
    return Array.isArray(parsed) ? parsed.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, fresh: false })) })) : [];
  } catch {
    return [];
  }
}

export function writeChats(chats: Chat[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(chats.filter((c) => c.messages.length > 0)));
  } catch {
    /* storage unavailable, chats just will not survive a reload */
  }
}
