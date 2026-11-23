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

export const CATEGORIES: Category[] = [
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

export const APPROVALS: Approval[] = [
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

export const ALL_VIEW: View = {
  key: 'all',
  label: 'All workspaces',
  icon: LayoutDashboard,
  activity: CATEGORIES.map((c) => c.activity[0]).slice(0, 5),
  builds: CATEGORIES.map((c) => c.builds[0]).sort((a, b) => b.pct - a.pct).slice(0, 3),
};

export const WEEK: Record<string, [number, number, number]> = {
  all: [23, 65, 213],
  itsm: [4, 11, 38],
  itom: [2, 6, 21],
  itam: [3, 8, 27],
  hrsd: [5, 14, 45],
  csm: [3, 9, 30],
  secops: [6, 17, 52],
};

export const APPROVED_SHARE: Record<string, number> = {
  all: 0.64,
  itsm: 0.57,
  itom: 0.78,
  itam: 0.66,
  hrsd: 0.5,
  csm: 0.72,
  secops: 0.64,
};
