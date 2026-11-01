import { db } from '@/lib/db'
import { decryptField, encryptField, isEncryptedField } from '@/lib/field-crypto'
import { hashPassword } from '@/lib/password'

function presentUser<T extends { cnic?: string | null }>(user: T) {
  return { ...user, cnic: decryptField(user.cnic) }
}

async function sealCnic(id: string, cnic: string | null | undefined) {
  if (!cnic || isEncryptedField(cnic)) return
  await db.user.update({ where: { id }, data: { cnic: encryptField(cnic) } })
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role?: string
  phone?: string
  cnic?: string
  city?: string
  address?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: string
  phone?: string | null
  cnic?: string | null
  address?: string | null
  city?: string | null
  avatar?: string | null
  bio?: string | null
  specialization?: string | null
  experience?: number | null
  barLicense?: string | null
  active?: boolean
}

export async function getUsers(filters?: { role?: string }) {
  const where: Record<string, unknown> = {}
  if (filters?.role) {
    where.role = filters.role
  }

  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      cnic: true,
      address: true,
      city: true,
      avatar: true,
      bio: true,
      specialization: true,
      experience: true,
      barLicense: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  await Promise.all(users.map((user) => sealCnic(user.id, user.cnic)))
  return users.map(presentUser)
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      cnic: true,
      address: true,
      city: true,
      avatar: true,
      bio: true,
      specialization: true,
      experience: true,
      barLicense: true,
      active: true,
      createdAt: true,
    },
  })

  if (!user) return user
  await sealCnic(user.id, user.cnic)
  return presentUser(user)
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  return user
}

export async function createUser(data: CreateUserInput) {
  const { name, email, password, role, phone, cnic, city, address } = data

  const hashed = await hashPassword(password)

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: role || 'CLIENT',
      phone: phone || null,
      cnic: encryptField(cnic),
      city: city || null,
      address: address || null,
    },
  })

  const { password: _password, sessionVersion: _sessionVersion, ...safeUser } = user
  return presentUser(safeUser)
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const next = { ...data }
  if (typeof next.cnic === 'string') next.cnic = encryptField(next.cnic)
  const user = await db.user.update({
    where: { id },
    data: next,
  })

  const { password: _password, sessionVersion: _sessionVersion, ...safeUser } = user
  return presentUser(safeUser)
}

export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } })
}
