import { Headset, LayoutDashboard, Package, Server, Shield, Users, Wrench, type LucideIcon } from 'lucide-react';

/** Sample portal data. Illustrative only. */
export type Tone = 'build' | 'review' | 'done' | 'draft';

export interface Activity {
  text: string;
  when: string;
  tone: Tone;
}
export interface Build {
  name: string;
  stage: string;
  pct: number;
}
export interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
  activity: Activity[];
  builds: Build[];
}

export const ALL_CATEGORIES: Category[] = [
  {
    key: 'itsm',
    label: 'ITSM',
    icon: Headset,
    activity: [
      { text: 'Incident triage flow moved to Test', when: '2m', tone: 'build' },
      { text: 'Major incident runbook drafted', when: '14m', tone: 'draft' },
      { text: 'Assignment rules approved by M. Chen', when: '1h', tone: 'done' },
      { text: 'SLA definitions need your review', when: '3h', tone: 'review' },
    ],
    builds: [
      { name: 'Incident triage', stage: 'Test', pct: 62 },
      { name: 'Change approval flow', stage: 'Develop', pct: 38 },
      { name: 'Knowledge article agent', stage: 'Define', pct: 18 },
    ],
  },
  {
    key: 'itom',
    label: 'ITOM',
    icon: Server,
    activity: [
      { text: 'Event rules mapped to 24 services', when: '6m', tone: 'build' },
      { text: 'Discovery schedule sent for review', when: '32m', tone: 'review' },
      { text: 'Alert enrichment flow published', when: '2h', tone: 'done' },
      { text: 'CMDB health report drafted', when: '5h', tone: 'draft' },
    ],
    builds: [
      { name: 'Alert enrichment', stage: 'Deploy', pct: 92 },
      { name: 'Service mapping', stage: 'Develop', pct: 47 },
      { name: 'Runbook automation', stage: 'Define', pct: 22 },
    ],
  },
  {
    key: 'itam',
    label: 'ITAM',
    icon: Package,
    activity: [
      { text: 'Asset intake catalog item published', when: '9m', tone: 'done' },
      { text: 'Software licence report drafted', when: '41m', tone: 'draft' },
      { text: 'Hardware refresh workflow in Test', when: '2h', tone: 'build' },
      { text: 'Disposal approval rules need review', when: '4h', tone: 'review' },
    ],
    builds: [
      { name: 'Asset intake', stage: 'Deploy', pct: 88 },
      { name: 'Hardware refresh', stage: 'Test', pct: 58 },
      { name: 'Licence tracker', stage: 'Develop', pct: 34 },
    ],
  },
  {
    key: 'hrsd',
    label: 'HRSD',
    icon: Users,
    activity: [
      { text: 'Employee onboarding app awaiting approval', when: '4m', tone: 'review' },
      { text: 'Offboarding task template generated', when: '27m', tone: 'draft' },
      { text: 'HR case routing moved to Develop', when: '1h', tone: 'build' },
      { text: 'Benefits request form approved', when: '3h', tone: 'done' },
    ],
    builds: [
      { name: 'Employee onboarding', stage: 'Document', pct: 81 },
      { name: 'Offboarding', stage: 'Develop', pct: 44 },
      { name: 'HR case routing', stage: 'Develop', pct: 36 },
    ],
  },
  {
    key: 'csm',
    label: 'CSM',
    icon: Wrench,
    activity: [
      { text: 'Case routing rules moved to Test', when: '11m', tone: 'build' },
      { text: 'SLA escalation flow approved', when: '58m', tone: 'done' },
      { text: 'Customer portal page drafted', when: '2h', tone: 'draft' },
      { text: 'Entitlement checks need your review', when: '6h', tone: 'review' },
    ],
    builds: [
      { name: 'Case routing', stage: 'Test', pct: 66 },
      { name: 'SLA escalation', stage: 'Deploy', pct: 90 },
      { name: 'Customer portal', stage: 'Define', pct: 24 },
    ],
  },
  {
    key: 'secops',
    label: 'SecOps',
    icon: Shield,
    activity: [
      { text: 'Access review process built', when: '7m', tone: 'done' },
      { text: 'Vulnerability response flow in Develop', when: '36m', tone: 'build' },
      { text: 'Audit trail report generated', when: '2h', tone: 'draft' },
      { text: 'Exception policy sent for sign-off', when: '5h', tone: 'review' },
    ],
    builds: [
      { name: 'Access reviews', stage: 'Deploy', pct: 95 },
      { name: 'Vulnerability response', stage: 'Develop', pct: 41 },
      { name: 'Exception handling', stage: 'Define', pct: 15 },
    ],
  },
];

export const TONE: Record<Tone, { label: string; cls: string }> = {
  build: { label: 'Building', cls: 'bg-brand-green/15 text-brand-green' },
  review: { label: 'Review', cls: 'bg-muted text-foreground' },
  done: { label: 'Approved', cls: 'bg-brand-green/15 text-brand-green' },
  draft: { label: 'Drafted', cls: 'bg-muted text-muted-foreground' },
};

/* ------------------------------------------------------------------ */
/* Approvals: the single source for every count shown in the app       */
/* ------------------------------------------------------------------ */

export interface Approval {
  id: string;
  cat: string;
  title: string;
  stage: string;
  by: string;
  age: string;
  summary: string;
  artifacts: number;
}

export type Decision = 'approved' | 'changes';
export type Decisions = Record<string, Decision>;

export const ALL_APPROVALS: Approval[] = [
  { id: 'a1', cat: 'itsm', title: 'Incident triage', stage: 'Test', by: 'Maria Chen', age: '12m', summary: 'ATF suite passes. Routing rules ready to promote to production.', artifacts: 6 },
  { id: 'a2', cat: 'itsm', title: 'Change approval flow', stage: 'Develop', by: 'Priya Nair', age: '1h', summary: 'Flow and approval groups configured for standard and normal changes.', artifacts: 5 },
  { id: 'a3', cat: 'itsm', title: 'Knowledge article agent', stage: 'Define', by: 'Tom Walker', age: '3h', summary: 'User stories and acceptance criteria captured from the workshop.', artifacts: 3 },
  { id: 'a4', cat: 'itom', title: 'Alert enrichment', stage: 'Deploy', by: 'Sam Ortiz', age: '32m', summary: 'Update set staged. Rollback plan attached.', artifacts: 4 },
  { id: 'a5', cat: 'itam', title: 'Asset intake', stage: 'Deploy', by: 'Lena Fischer', age: '9m', summary: 'Catalog item and fulfilment tasks ready for promotion.', artifacts: 5 },
  { id: 'a6', cat: 'itam', title: 'Hardware refresh', stage: 'Test', by: 'Lena Fischer', age: '2h', summary: 'Refresh workflow validated against 12 test scenarios.', artifacts: 4 },
  { id: 'a7', cat: 'hrsd', title: 'Employee onboarding', stage: 'Document', by: 'Alex Morgan', age: '4m', summary: 'Training guide and release notes drafted for the onboarding app.', artifacts: 7 },
  { id: 'a8', cat: 'hrsd', title: 'Offboarding', stage: 'Develop', by: 'Dana Reyes', age: '27m', summary: 'Task templates and equipment return flow built.', artifacts: 4 },
  { id: 'a9', cat: 'hrsd', title: 'HR case routing', stage: 'Develop', by: 'Dana Reyes', age: '1h', summary: 'Routing rules by case type and region configured.', artifacts: 3 },
  { id: 'a10', cat: 'hrsd', title: 'Benefits request form', stage: 'Deploy', by: 'Jo Park', age: '3h', summary: 'Form and approvals tested. Ready for release.', artifacts: 5 },
  { id: 'a11', cat: 'csm', title: 'Case routing', stage: 'Test', by: 'Ines Duarte', age: '11m', summary: 'Routing and SLA timers verified in the test instance.', artifacts: 5 },
  { id: 'a12', cat: 'csm', title: 'SLA escalation', stage: 'Deploy', by: 'Ines Duarte', age: '58m', summary: 'Escalation flow staged with notification templates.', artifacts: 4 },
  { id: 'a13', cat: 'secops', title: 'Access reviews', stage: 'Deploy', by: 'Kofi Mensah', age: '7m', summary: 'Review tasks and attestation records ready to go live.', artifacts: 6 },
  { id: 'a14', cat: 'secops', title: 'Vulnerability response', stage: 'Develop', by: 'Noor Haddad', age: '36m', summary: 'Prioritisation rules and remediation tasks built.', artifacts: 5 },
  { id: 'a15', cat: 'secops', title: 'Exception handling', stage: 'Define', by: 'Noor Haddad', age: '2h', summary: 'Exception policy and sign-off steps defined.', artifacts: 3 },
  { id: 'a16', cat: 'secops', title: 'Audit trail report', stage: 'Document', by: 'Kofi Mensah', age: '5h', summary: 'Evidence report generated for the quarterly review.', artifacts: 2 },
  { id: 'a17', cat: 'secops', title: 'Privileged access policy', stage: 'Test', by: 'Kofi Mensah', age: '6h', summary: 'Policy checks pass. Awaiting security sign-off.', artifacts: 4 },
];

export let CATEGORIES: Category[] = ALL_CATEGORIES;
export let APPROVALS: Approval[] = ALL_APPROVALS;

export const pendingCount = (d: Decisions, cat?: string): number =>
  APPROVALS.filter((a) => !d[a.id] && (!cat || cat === 'all' || a.cat === cat)).length;

/* ------------------------------------------------------------------ */
/* "All workspaces": a roll-up shown on Home                           */
/* ------------------------------------------------------------------ */

export interface View {
  key: string;
  label: string;
  icon: LucideIcon;
  activity: Activity[];
  builds: Build[];
}

const buildAllView = (cats: Category[]): View => ({
  key: 'all',
  label: 'All workspaces',
  icon: LayoutDashboard,
  activity: cats.map((c) => c.activity[0]).slice(0, 5),
  builds: cats.map((c) => c.builds[0]).sort((a, b) => b.pct - a.pct).slice(0, 3),
});
export let ALL_VIEW: View = buildAllView(ALL_CATEGORIES);

const BASE_WEEK: Record<string, [number, number, number]> = {
  all: [23, 65, 213],
  itsm: [4, 11, 38],
  itom: [2, 6, 21],
  itam: [3, 8, 27],
  hrsd: [5, 14, 45],
  csm: [3, 9, 30],
  secops: [6, 17, 52],
};

const BASE_SHARE: Record<string, number> = {
  all: 0.64,
  itsm: 0.57,
  itom: 0.78,
  itam: 0.66,
  hrsd: 0.5,
  csm: 0.72,
  secops: 0.64,
};

/* ------------------------------------------------------------------ */
/* Apps: what Acme has built for the instance                   */
/* ------------------------------------------------------------------ */

export const STAGES = ['Define', 'Develop', 'Test', 'Document', 'Deploy'] as const;
const STAGE_PCT = [18, 40, 62, 82, 94];
const ARTIFACT_NAMES = [
  'Requirements document',
  'User stories',
  'Data model',
  'Workflow diagram',
  'Role matrix',
  'Test script',
  'Training guide',
  'Release notes',
  'Deployment checklist',
];

export interface AppItem {
  id: string;
  name: string;
  cat: string;
  version: string;
  owner: string;
  updated: string;
  description: string;
  /** 0 to 4 for the five build stages, 5 once the app is live. */
  stage: number;
  pct: number;
  /** The approval that gates this app's current stage, if there is one. */
  approvalId?: string;
  artifacts: string[];
  activity: string[];
}

const LIVE: Omit<AppItem, 'stage' | 'pct' | 'approvalId'>[] = [
  { id: 'app-l1', name: 'Major incident runbook', cat: 'itsm', version: '1.2', owner: 'Maria Chen', updated: '2d', description: 'Runbook flows and communication templates for P1 incidents.', artifacts: ARTIFACT_NAMES.slice(0, 7), activity: ['Promoted to production', 'Release notes published', 'Approved by Maria Chen'] },
  { id: 'app-l2', name: 'CMDB health report', cat: 'itom', version: '1.0', owner: 'Sam Ortiz', updated: '4d', description: 'Weekly completeness and correctness report across key classes.', artifacts: ARTIFACT_NAMES.slice(0, 6), activity: ['Promoted to production', 'Scheduled report enabled', 'Approved by Sam Ortiz'] },
  { id: 'app-l3', name: 'Software licence tracker', cat: 'itam', version: '1.1', owner: 'Lena Fischer', updated: '1w', description: 'Tracks entitlements and flags over-use before renewal.', artifacts: ARTIFACT_NAMES.slice(0, 7), activity: ['Promoted to production', 'Renewal alerts configured', 'Approved by Lena Fischer'] },
  { id: 'app-l4', name: 'Policy acknowledgement', cat: 'hrsd', version: '1.0', owner: 'Jo Park', updated: '1w', description: 'Collects employee sign-off on policy updates with an audit trail.', artifacts: ARTIFACT_NAMES.slice(0, 6), activity: ['Promoted to production', 'Reminder flow enabled', 'Approved by Jo Park'] },
  { id: 'app-l5', name: 'Customer portal', cat: 'csm', version: '2.0', owner: 'Ines Duarte', updated: '2w', description: 'Self-service pages for cases, entitlements and knowledge.', artifacts: ARTIFACT_NAMES.slice(0, 8), activity: ['Promoted to production', 'Accessibility review passed', 'Approved by Ines Duarte'] },
  { id: 'app-l6', name: 'Security incident response', cat: 'secops', version: '1.3', owner: 'Noor Haddad', updated: '3w', description: 'Triage, containment and evidence tracking for security incidents.', artifacts: ARTIFACT_NAMES.slice(0, 8), activity: ['Promoted to production', 'Playbooks linked', 'Approved by Noor Haddad'] },
];

const ALL_APPS: AppItem[] = [
  ...ALL_APPROVALS.map((a): AppItem => {
    const stage = STAGES.indexOf(a.stage as (typeof STAGES)[number]);
    return {
      id: `app-${a.id}`,
      name: a.title,
      cat: a.cat,
      version: `0.${stage + 1}`,
      owner: a.by,
      updated: a.age,
      description: a.summary,
      stage,
      pct: STAGE_PCT[stage] ?? 50,
      approvalId: a.id,
      artifacts: ARTIFACT_NAMES.slice(0, Math.min(a.artifacts, ARTIFACT_NAMES.length)),
      activity: [`${a.by} submitted the ${a.stage} stage for approval`, `Agents generated ${a.artifacts} artifacts`, 'Requirements captured from the workshop'],
    };
  }),
  ...LIVE.map((l): AppItem => ({ ...l, stage: 5, pct: 100 })),
];

export let APPS: AppItem[] = ALL_APPS;

export type AppStatus = 'live' | 'approval' | 'approved' | 'changes' | 'building';

/** An app's status follows its approval: deciding on it in Approvals changes it here. */
export function appStatus(app: AppItem, decisions: Decisions): AppStatus {
  if (app.stage >= 5) return 'live';
  const d = app.approvalId ? decisions[app.approvalId] : undefined;
  if (d === 'approved') return 'approved';
  if (d === 'changes') return 'changes';
  return app.approvalId ? 'approval' : 'building';
}

export const APP_STATUS_LABEL: Record<AppStatus, { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'bg-brand-green/15 text-brand-green' },
  approval: { label: 'Needs approval', cls: 'bg-foreground text-background' },
  approved: { label: 'Approved', cls: 'bg-brand-green/15 text-brand-green' },
  changes: { label: 'Changes requested', cls: 'bg-muted text-foreground' },
  building: { label: 'In build', cls: 'bg-muted text-muted-foreground' },
};

/* ------------------------------------------------------------------ */
/* Roles: each role only sees the workspaces it works in               */
/* ------------------------------------------------------------------ */

export interface Role {
  key: string;
  label: string;
  /** Workspace keys this role can see. */
  cats: string[];
}

export const ROLES: Role[] = [
  { key: 'admin', label: 'Platform Admin', cats: ALL_CATEGORIES.map((c) => c.key) },
  { key: 'itsm', label: 'IT Service Manager', cats: ['itsm', 'itom', 'itam'] },
  { key: 'hr', label: 'HR Business Partner', cats: ['hrsd'] },
  { key: 'sec', label: 'Security Lead', cats: ['secops', 'itom'] },
  { key: 'cs', label: 'Customer Support Lead', cats: ['csm', 'itsm'] },
];

export const DEFAULT_ROLE = 'itsm';

export let WEEK: Record<string, [number, number, number]> = BASE_WEEK;
export const APPROVED_SHARE: Record<string, number> = { ...BASE_SHARE };

/**
 * Narrow every list in this module to what a role can see. The lists above are live bindings, so
 * components read the scoped data without being passed it. Call it before rendering for a role.
 */
export function setRole(key: string): Role {
  const role = ROLES.find((r) => r.key === key) ?? ROLES[0];
  const keep = new Set(role.cats);
  CATEGORIES = ALL_CATEGORIES.filter((c) => keep.has(c.key));
  APPROVALS = ALL_APPROVALS.filter((a) => keep.has(a.cat));
  APPS = ALL_APPS.filter((a) => keep.has(a.cat));
  ALL_VIEW = buildAllView(CATEGORIES);
  const sum = [0, 1, 2].map((i) => role.cats.reduce((n, k) => n + (BASE_WEEK[k]?.[i] ?? 0), 0)) as [number, number, number];
  WEEK = { ...BASE_WEEK, all: sum };
  const shares = role.cats.map((k) => BASE_SHARE[k] ?? 0.6);
  APPROVED_SHARE.all = shares.reduce((a, b) => a + b, 0) / Math.max(1, shares.length);
  return role;
}
