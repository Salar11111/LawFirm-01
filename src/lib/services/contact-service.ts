import { db } from '@/lib/db'

export interface CreateContactInput {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export async function getContacts() {
  const messages = await db.contact.findMany({ orderBy: { createdAt: 'desc' } })
  return messages
}

export async function createContact(data: CreateContactInput) {
  const { name, email, phone, subject, message } = data

  const contact = await db.contact.create({
    data: {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'NEW',
    },
  })
  return contact
}

export async function updateContact(id: string, status: string, userId: string) {
  const updated = await db.contact.update({
    where: { id },
    data: { status, handledBy: userId },
  })
  return updated
}
