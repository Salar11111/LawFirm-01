// Display label maps for the client portal

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Initial Consultation',
  HEARING_PREP: 'Hearing Preparation',
  FOLLOW_UP: 'Follow-up',
  DOCUMENT_REVIEW: 'Document Review',
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const CASE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  HEARING: 'In Hearing',
  ADJOURNED: 'Adjourned',
  CLOSED: 'Closed',
  WON: 'Won',
  LOST: 'Lost',
}

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CONTRACT: 'Contract',
  PETITION: 'Petition',
  EVIDENCE: 'Evidence',
  COURT_FILING: 'Court Filing',
  ID_PROOF: 'ID Proof',
  AGREEMENT: 'Agreement',
  OTHER: 'Other',
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}

export const UPDATE_TYPE_LABELS: Record<string, string> = {
  NOTE: 'Note',
  FILING: 'Filing',
  HEARING: 'Hearing',
  RULING: 'Ruling',
  DOCUMENT: 'Document',
}

export function labelOf(map: Record<string, string>, key: string): string {
  return map[key] ?? key
}
