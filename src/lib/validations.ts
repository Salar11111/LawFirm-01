import { z } from 'zod'
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CASE_STATUSES,
  CASE_UPDATE_TYPES,
  CONTACT_STATUSES,
  DOCUMENT_TYPES,
  INVOICE_STATUSES,
  PRIORITIES,
} from '@/lib/enums'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})

export const caseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  practiceArea: z.string().min(1, 'Practice area is required'),
  court: z.string().optional(),
  status: z.enum(CASE_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  filedDate: z.string().optional(),
  nextHearing: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  lawyerId: z.string().min(1, 'Lawyer ID is required'),
})

export const caseUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  practiceArea: z.string().optional(),
  court: z.string().optional(),
  status: z.enum(CASE_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  nextHearing: z.string().optional(),
  lawyerId: z.string().optional(),
  filedDate: z.string().optional(),
})

export const caseUpdateCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  updateType: z.enum(CASE_UPDATE_TYPES).optional(),
})

export const appointmentSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  clientId: z.string().min(1).optional(),
  lawyerId: z.string().min(1, 'Lawyer ID is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().int().positive().optional(),
  type: z.enum(APPOINTMENT_TYPES).optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().optional(),
})

export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(DOCUMENT_TYPES),
  fileName: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  fileUrl: z.string().optional(),
  description: z.string().optional(),
  caseId: z.string().optional(),
})

export const invoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
})

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1).optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  caseId: z.string().nullish(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  paidDate: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  items: z.array(invoiceItemSchema).optional(),
})

export const invoiceStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(INVOICE_STATUSES),
})

export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Content is required').max(5000),
})

export const contactStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(CONTACT_STATUSES),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CaseCreateInput = z.infer<typeof caseCreateSchema>
export type CaseUpdateInput = z.infer<typeof caseUpdateSchema>
export type CaseUpdateCreateInput = z.infer<typeof caseUpdateCreateSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type DocumentInput = z.infer<typeof documentSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type MessageInput = z.infer<typeof messageSchema>
