import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

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

  return users
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

  return user
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
      cnic: cnic || null,
      city: city || null,
      address: address || null,
    },
  })

  const { password: _password, ...safeUser } = user
  return safeUser
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await db.user.update({
    where: { id },
    data,
  })

  const { password: _password, ...safeUser } = user
  return safeUser
}

export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } })
}
