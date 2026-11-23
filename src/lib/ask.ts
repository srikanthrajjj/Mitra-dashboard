import { SHOW_APPS } from '../config';
import { APPROVALS, APPS, CATEGORIES, WEEK, appStatus, pendingCount, type AppItem, type Approval, type Decisions } from '../data';

/**
 * A small, deterministic stand-in for the assistant: it reads the question, decides what the
 * person wants (approvals, apps, a new build, a summary) and returns a structured answer that
 * the UI can show step by step. No network, so the demo behaves the same every time.
 */

export type Answer =
  | { kind: 'approvals'; steps: string[]; items: Approval[]; total: number; scope: string }
  | { kind: 'apps'; steps: string[]; items: AppItem[]; scope: string }
  | { kind: 'plan'; steps: string[]; name: string; tasks: string[]; scope: string }
  | { kind: 'summary'; steps: string[]; lines: { label: string; value: string }[]; scope: string }
  | { kind: 'text'; steps: string[]; text: string }
  | { kind: 'none'; steps: string[] };

export type Suggestion =
  | { id: string; kind: 'ask'; text: string; hint: string }
  | { id: string; kind: 'app'; app: AppItem }
  | { id: string; kind: 'approval'; approval: Approval };

export const STARTERS: { text: string; hint: string }[] = [
  { text: 'What is waiting on my approval?', hint: 'Approvals' },
  SHOW_APPS ? { text: 'Show apps in progress', hint: 'Apps' } : { text: 'What is waiting in SecOps?', hint: 'Approvals' },
  { text: 'Build a vendor intake app with a risk checklist', hint: 'Build' },
  { text: 'Summarise this week', hint: 'Summary' },
];

function workspaceIn(q: string, fallback: string): string {
  const hit = CATEGORIES.find((c) => new RegExp(`\\b${c.key}\\b`, 'i').test(q) || q.includes(c.label.toLowerCase()));
  return hit ? hit.key : fallback;
}

const label = (cat: string) => (cat === 'all' ? 'all workspaces' : (CATEGORIES.find((c) => c.key === cat)?.label ?? cat));

function planName(q: string): string {
  const cleaned = q
    .replace(/^(please\s+)?(can you\s+)?(build|create|make|set up|design)\s+(me\s+)?(a|an|the)?\s*/i, '')
    .replace(/\s+(with|that|which|for)\s+.*$/i, '')
    .trim();
  const name = cleaned || 'New app';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function route(query: string, decisions: Decisions, scope: string): Answer {
  const q = query.trim();
  const lc = q.toLowerCase();

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(lc)) {
    return { kind: 'text', steps: [], text: 'Hi! I can show you what is waiting on your approval, find an app, summarise the week, or plan a new build. What would you like to do?' };
  }
  if (/^(thanks|thank you|cheers)\b/.test(lc)) {
    return { kind: 'text', steps: [], text: 'You are welcome. Ask me anything else about your apps and approvals.' };
  }

  const cat = workspaceIn(lc, scope);
  const where = label(cat);

  if (/\b(build|create|make|set up|design|new app)\b/.test(lc)) {
    return {
      kind: 'plan',
      scope: where,
      name: planName(q),
      steps: ['Reading your request', `Matching it to ${where === 'all workspaces' ? 'the right workspace' : where}`, 'Drafting a six-step plan'],
      tasks: [
        'Capture requirements and acceptance criteria',
        'Design tables, flows and roles',
        'Build catalog items and automation',
        'Generate and run the test suite',
        'Write training material and release notes',
        'Stage everything for your approval',
      ],
    };
  }

  if (/\b(approv|waiting|review|sign.?off|pending)/.test(lc)) {
    const items = APPROVALS.filter((a) => !decisions[a.id] && (cat === 'all' || a.cat === cat));
    return {
      kind: 'approvals',
      scope: where,
      total: items.length,
      items: items.slice(0, 4),
      steps: ['Checking your approvals', `Looking in ${where}`, `${items.length} waiting on you`],
    };
  }

  if (/\b(summar|week|overview|status|how are we)/.test(lc)) {
    const w = WEEK[cat] ?? WEEK.all;
    const inBuild = APPS.filter((a) => a.stage < 5 && (cat === 'all' || a.cat === cat)).length;
    return {
      kind: 'summary',
      scope: where,
      steps: ['Collecting this week’s activity', `Scope: ${where}`, 'Writing the summary'],
      lines: [
        { label: 'Builds shipped', value: String(w[0]) },
        { label: 'Approvals given', value: String(w[1]) },
        { label: 'Skills run', value: String(w[2]) },
        { label: 'Waiting on you', value: String(pendingCount(decisions, cat)) },
        { label: 'Apps in build', value: String(inBuild) },
      ],
    };
  }

  if (/\b(app|apps|live|in progress|building|shipped|portal)\b/.test(lc) || cat !== scope) {
    const wantLive = /\blive\b|shipped|production/.test(lc);
    const wantBuild = /progress|building|in build|draft/.test(lc);
    const wantApproval = /needs? approval/.test(lc);
    const items = APPS.filter((a) => {
      if (cat !== 'all' && a.cat !== cat) return false;
      const s = appStatus(a, decisions);
      if (wantLive) return s === 'live';
      if (wantApproval) return s === 'approval';
      if (wantBuild) return s !== 'live';
      return true;
    });
    return {
      kind: 'apps',
      scope: where,
      items: items.slice(0, 5),
      steps: ['Searching your apps', `Looking in ${where}`, `${items.length} found`],
    };
  }

  // Last resort: match on words that appear in an app or approval name.
  const words = lc.split(/\W+/).filter((w) => w.length > 3);
  const hits = APPS.filter((a) => words.some((w) => a.name.toLowerCase().includes(w)));
  if (hits.length) {
    return { kind: 'apps', scope: where, items: hits.slice(0, 5), steps: ['Searching your apps', 'Matching names', `${hits.length} found`] };
  }
  return { kind: 'none', steps: ['Reading your question', 'Searching apps and approvals', 'No close match'] };
}

/** What the dropdown shows under the search bar while typing. */
export function suggest(query: string, decisions: Decisions): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return STARTERS.map((s, i) => ({ id: `s${i}`, kind: 'ask', text: s.text, hint: s.hint }));
  const out: Suggestion[] = [{ id: 'ask', kind: 'ask', text: query.trim(), hint: 'Ask Mitra' }];
  (SHOW_APPS ? APPS : [])
    .filter((a) => a.name.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((app) => out.push({ id: app.id, kind: 'app', app }));
  APPROVALS.filter((a) => !decisions[a.id] && a.title.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach((approval) => out.push({ id: approval.id, kind: 'approval', approval }));
  return out;
}
