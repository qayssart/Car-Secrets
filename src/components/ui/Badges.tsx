import type { Severity, RequestStatus, JobStatus } from '@/types';
import { severityConfig } from '@/lib/utils';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

const requestStatusConfig: Record<RequestStatus, { label: string; classes: string }> = {
  pending: {
    label: 'قيد الانتظار',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  accepted: {
    label: 'مقبول',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  declined: {
    label: 'مرفوض',
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  completed: {
    label: 'مكتمل',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config = requestStatusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}

const jobStatusConfig: Record<JobStatus, { label: string; classes: string }> = {
  scheduled: {
    label: 'مجدول',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  in_progress: {
    label: 'قيد التنفيذ',
    classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  completed: {
    label: 'مكتمل',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  cancelled: {
    label: 'ملغي',
    classes: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = jobStatusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}
