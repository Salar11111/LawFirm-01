import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { passwordSchema } from '../src/lib/validations'
import { readPage } from '../src/lib/pagination'
import { decryptField, encryptField } from '../src/lib/field-crypto'
import { matchesDeclaredType } from '../src/lib/storage'

describe('passwords', () => {
  it('requires eight characters, a letter, and a number', () => {
    assert.equal(passwordSchema.safeParse('admin123').success, true)
    assert.equal(passwordSchema.safeParse('short1').success, false)
    assert.equal(passwordSchema.safeParse('longpassword').success, false)
  })
})

describe('sessions carry a version', () => {
  it('keeps the version that can revoke older cookies', async () => {
    process.env.AUTH_SECRET = 'test-secret'
    const { createSession, verifySession } = await import('../src/lib/session')
    const token = createSession('user-1', Date.now(), 3)
    assert.equal(verifySession(token)?.v, 3)
  })
})

describe('private fields', () => {
  it('round-trips a CNIC and leaves older plain values readable', () => {
    process.env.AUTH_SECRET = 'test-secret'
    const sealed = encryptField('42101-1234567-1')
    assert.equal(sealed?.startsWith('enc:v1:'), true)
    assert.equal(decryptField(sealed), '42101-1234567-1')
    assert.equal(decryptField('42101-1234567-1'), '42101-1234567-1')
  })
})

describe('uploads', () => {
  it('accepts a PDF signature and rejects a renamed text file', () => {
    assert.equal(matchesDeclaredType('brief.pdf', Buffer.from('%PDF-1.7')), true)
    assert.equal(matchesDeclaredType('brief.pdf', Buffer.from('hello')), false)
    assert.equal(matchesDeclaredType('note.txt', Buffer.from('hello')), true)
    assert.equal(matchesDeclaredType('note.txt', Buffer.from([0x68, 0x00])), false)
  })
})

describe('pagination', () => {
  it('pages only when the caller asks for a page', () => {
    assert.equal(readPage(new URLSearchParams()), null)
    assert.deepEqual(readPage(new URLSearchParams('page=2&pageSize=10')), {
      page: 2,
      pageSize: 10,
      skip: 10,
      take: 10,
    })
  })
})
