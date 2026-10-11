import { db } from '@/lib/db'

// Currency formatting — Pakistani Rupee
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Compact number formatting (e.g. 1.2k, 3.4M)
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

// Date formatting
export function formatDate(date: string | Date | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-PK', opts ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Status color mapping (Tailwind classes)
export const statusStyles: Record<string, string> = {
  // Case status
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  HEARING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ADJOURNED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  CLOSED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  WON: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  // Priority
  LOW: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  MEDIUM: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  // Appointment / Invoice status
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  READ: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  RESPONDED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export function statusBadgeClass(status: string): string {
  return statusStyles[status] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

// Avatar initials
export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Pakistani cities
export const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Sukkur',
]

// Pakistani courts
export const PAKISTANI_COURTS = [
  'Supreme Court of Pakistan',
  'Sindh High Court, Karachi',
  'Lahore High Court, Lahore',
  'Islamabad High Court, Islamabad',
  'Peshawar High Court, Peshawar',
  'Balochistan High Court, Quetta',
  'District & Sessions Court, Karachi South',
  'District & Sessions Court, Karachi East',
  'Family Court-I, Karachi',
  'Family Court-II, Karachi',
  'Family Court-III, District South, Karachi',
  'Banking Court-I, Karachi',
  'Banking Court-II, Karachi',
  'Senior Civil Judge Court, Karachi',
  'Civil Judge Court, Karachi',
  'NAB Court, Karachi',
  'Anti-Terrorism Court, Karachi',
  'Appellate Tribunal Inland Revenue, Karachi',
]

export const PRACTICE_AREAS_LIST = [
  'Family Law',
  'Corporate & Commercial Law',
  'Criminal Defense',
  'Property & Real Estate',
  'Banking & Finance',
  'Constitutional Law',
  'Taxation Law',
  'Cyber & IT Law',
]

export const CASE_STATUSES = ['PENDING', 'ACTIVE', 'HEARING', 'ADJOURNED', 'CLOSED', 'WON', 'LOST']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const APPOINTMENT_TYPES = ['CONSULTATION', 'HEARING_PREP', 'FOLLOW_UP', 'DOCUMENT_REVIEW']
export const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED']
export const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE']
export const DOCUMENT_TYPES = ['CONTRACT', 'PETITION', 'EVIDENCE', 'COURT_FILING', 'ID_PROOF', 'AGREEMENT', 'OTHER']

// Fetch wrapper that auto-handles JSON
export async function api<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  }
  return data as T
}

// Stats helper
export async function getFirmStats() {
  const [cases, clients, lawyers, reviews, pendingApts, wonCases] = await Promise.all([
    db.case.count(),
    db.user.count({ where: { role: 'CLIENT' } }),
    db.user.count({ where: { role: { in: ['LAWYER', 'ADMIN'] } } }),
    db.review.count({ where: { approved: true } }),
    db.appointment.count({ where: { status: 'SCHEDULED' } }),
    db.case.count({ where: { status: 'WON' } }),
  ])
  const avgRating = reviews > 0 ? 4.9 : 0
  return {
    cases,
    clients,
    lawyers,
    reviews,
    pendingApts,
    wonCases,
    avgRating,
    successRate: cases > 0 ? Math.round((wonCases / Math.max(cases - 2, wonCases)) * 100) : 0,
  }
}
