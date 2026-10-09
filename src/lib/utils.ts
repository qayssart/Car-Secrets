import type { Severity } from '@/types';

export const severityConfig: Record<Severity, { label: string; classes: string; dot: string }> = {
  low: {
    label: 'منخفض',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'متوسط',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'عالي',
    classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  critical: {
    label: 'حرج',
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function highestSeverity(severities: Severity[]): Severity {
  const order: Severity[] = ['critical', 'high', 'medium', 'low'];
  for (const s of order) {
    if (severities.includes(s)) return s;
  }
  return 'low';
}
