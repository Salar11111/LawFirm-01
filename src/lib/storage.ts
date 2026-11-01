import { mkdir, readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'

export const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads')
const STORAGE_PREFIX = 'storage:'

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt'])

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function extensionOf(fileName: string) {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() || '' : ''
}

export function isAllowedUpload(fileName: string) {
  return ALLOWED_EXTENSIONS.has(extensionOf(fileName))
}

export function matchesDeclaredType(fileName: string, bytes: Buffer) {
  const ext = extensionOf(fileName)
  if (ext === 'pdf') return bytes.subarray(0, 5).toString('utf8') === '%PDF-'
  if (ext === 'png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (ext === 'jpg' || ext === 'jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (ext === 'docx') return bytes.length > 1 && bytes[0] === 0x50 && bytes[1] === 0x4b
  if (ext === 'doc') return bytes.length > 4 && bytes.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))
  if (ext === 'txt') return !bytes.subarray(0, Math.min(bytes.length, 1024)).includes(0)
  return false
}

export function contentTypeFor(fileName: string) {
  return MIME_BY_EXTENSION[extensionOf(fileName)] || 'application/octet-stream'
}

export function storedFileUrl(storedName: string) {
  return `${STORAGE_PREFIX}${storedName}`
}

export function storedNameFromUrl(fileUrl: string) {
  if (!fileUrl.startsWith(STORAGE_PREFIX)) return null
  return fileUrl.slice(STORAGE_PREFIX.length)
}

function resolveInsideUploadDir(storedName: string) {
  const root = path.resolve(UPLOAD_DIR)
  const full = path.resolve(root, storedName)
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('Invalid storage path')
  }
  return full
}

export function safeStoredName(id: string, original: string) {
  const base = path.basename(original).replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${id}-${base}`.slice(0, 180)
}

export async function saveUpload(storedName: string, data: Buffer) {
  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(resolveInsideUploadDir(storedName), data)
}

export async function readUpload(storedName: string) {
  return readFile(resolveInsideUploadDir(storedName))
}

export async function removeUpload(fileUrl: string) {
  const storedName = storedNameFromUrl(fileUrl)
  if (!storedName) return
  await unlink(resolveInsideUploadDir(storedName)).catch(() => {})
}
