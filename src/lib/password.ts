import crypto from 'crypto'

const SCRYPT_KEYLEN = 64
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1

/**
 * Hash a password using Node's built-in crypto.scrypt.
 * Returns a string in the format: "salt:hash" (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16)
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`)
    })
  })
}

/**
 * Verify a password against a stored "salt:hash" string.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.includes(':')) return false
  return new Promise((resolve, reject) => {
    const [saltHex, hashHex] = stored.split(':')
    const salt = Buffer.from(saltHex, 'hex')
    const hash = Buffer.from(hashHex, 'hex')
    crypto.scrypt(password, salt, hash.length, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(crypto.timingSafeEqual(derivedKey, hash))
    })
  })
}
