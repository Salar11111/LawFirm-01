import crypto from 'crypto'
import { secretKey } from '@/lib/secret'

const PREFIX = 'enc:v1:'

export function encryptField(value: string | null | undefined) {
  if (!value) return null
  if (value.startsWith(PREFIX)) return value
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export function decryptField(value: string | null | undefined) {
  if (!value) return null
  if (!value.startsWith(PREFIX)) return value
  const raw = Buffer.from(value.slice(PREFIX.length), 'base64url')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const encrypted = raw.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function isEncryptedField(value: string | null | undefined) {
  return Boolean(value && value.startsWith(PREFIX))
}
