import { Headset, Package, Server, Shield, Users, Wrench, type LucideIcon } from 'lucide-react';

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
  pending: number;
  activity: Activity[];
  builds: Build[];
}

export const CATEGORIES: Category[] = [
  {
    key: 'itsm',
    label: 'ITSM',
    icon: Headset,
    pending: 3,
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
    pending: 1,
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
    pending: 2,
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
    pending: 4,
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
    pending: 2,
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
    pending: 5,
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
