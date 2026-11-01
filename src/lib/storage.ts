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
