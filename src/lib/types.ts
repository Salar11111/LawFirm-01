export type UserRole = 'ADMIN' | 'LAWYER' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone: string | null
  cnic: string | null
  address: string | null
  city: string | null
  avatar: string | null
  bio: string | null
  specialization: string | null
  experience: number | null
  barLicense: string | null
  active: boolean
}

export interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  practiceArea: string
  court: string
  status: string
  priority: string
  filedDate: string
  nextHearing: string | null
  closedDate: string | null
  clientId: string
  lawyerId: string
  client?: User
  lawyer?: User
  updates?: CaseUpdate[]
  documents?: Document[]
  createdAt: string
  updatedAt: string
}

export interface CaseUpdate {
  id: string
  caseId: string
  title: string
  description: string
  updateType: string
  createdBy: string
  createdAt: string
}

export interface Appointment {
  id: string
  clientId: string
  lawyerId: string
  date: string
  time: string
  duration: number
  type: string
  status: string
  notes: string | null
  subject: string
  client?: User
  lawyer?: User
  createdAt: string
}

export interface DocumentItem {
  id: string
  caseId: string | null
  uploadedBy: string
  title: string
  type: string
  fileName: string
  fileSize: number
  fileUrl: string
  description: string | null
  uploader?: User
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  caseId: string | null
  amount: number
  currency: string
  status: string
  dueDate: string
  paidDate: string | null
  description: string
  items: string
  client?: User
  case?: Case
  createdAt: string
}

export interface Review {
  id: string
  name: string
  role: string
  content: string
  rating: number
  lawyerId: string | null
  approved: boolean
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export interface PracticeArea {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  icon: string
  features: string
  createdAt: string
}

export type ViewMode =
  | 'home'
  | 'practice-areas'
  | 'team'
  | 'about'
  | 'contact'
  | 'client-portal'
  | 'admin-portal'
