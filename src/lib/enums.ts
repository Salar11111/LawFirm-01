export const ROLES = ['ADMIN', 'LAWYER', 'CLIENT'] as const
export const CASE_STATUSES = ['PENDING', 'ACTIVE', 'HEARING', 'ADJOURNED', 'CLOSED', 'WON', 'LOST'] as const
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export const APPOINTMENT_TYPES = ['CONSULTATION', 'HEARING_PREP', 'FOLLOW_UP', 'DOCUMENT_REVIEW'] as const
export const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE'] as const
export const DOCUMENT_TYPES = ['CONTRACT', 'PETITION', 'EVIDENCE', 'COURT_FILING', 'ID_PROOF', 'AGREEMENT', 'OTHER'] as const
export const CASE_UPDATE_TYPES = ['NOTE', 'FILING', 'HEARING', 'RULING', 'DOCUMENT'] as const
export const CONTACT_STATUSES = ['NEW', 'READ', 'RESPONDED', 'CLOSED'] as const

export type Role = (typeof ROLES)[number]
export type CaseStatus = (typeof CASE_STATUSES)[number]
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]
