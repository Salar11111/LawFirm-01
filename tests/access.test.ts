import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canAccessMatter, canReadDocument, invoiceAmount } from '../src/lib/access'
import { verifyCsrfToken } from '../src/lib/csrf'
import { RateLimiter } from '../src/lib/rate-limit'

describe('matter access', () => {
  const matter = { clientId: 'client-1', lawyerId: 'lawyer-1' }

  it('lets an admin read any matter', () => {
    assert.equal(canAccessMatter('ADMIN', 'someone-else', matter), true)
  })

  it('limits a lawyer to assigned matters', () => {
    assert.equal(canAccessMatter('LAWYER', 'lawyer-1', matter), true)
    assert.equal(canAccessMatter('LAWYER', 'lawyer-2', matter), false)
  })

  it('limits a client to their own matter', () => {
    assert.equal(canAccessMatter('CLIENT', 'client-1', matter), true)
    assert.equal(canAccessMatter('CLIENT', 'client-2', matter), false)
  })
})

describe('document access', () => {
  it('hides unassigned files from clients', () => {
    const document = { uploadedBy: 'lawyer-1', case: null }
    assert.equal(canReadDocument('CLIENT', 'client-1', document), false)
    assert.equal(canReadDocument('LAWYER', 'lawyer-1', document), true)
    assert.equal(canReadDocument('ADMIN', 'admin-1', document), true)
  })

  it('follows the case assignment when a file is attached', () => {
    const document = {
      uploadedBy: 'lawyer-1',
      case: { clientId: 'client-1', lawyerId: 'lawyer-1' },
    }
    assert.equal(canReadDocument('CLIENT', 'client-1', document), true)
    assert.equal(canReadDocument('CLIENT', 'client-2', document), false)
    assert.equal(canReadDocument('LAWYER', 'lawyer-2', document), false)
  })
})

describe('invoice totals', () => {
  it('sums line items instead of trusting the submitted amount', () => {
    assert.equal(
      invoiceAmount(1, [
        { quantity: 2, unitPrice: 1500 },
        { quantity: 1, unitPrice: 500 },
      ]),
      3500,
    )
  })

  it('keeps the amount when there are no line items', () => {
    assert.equal(invoiceAmount(4200), 4200)
  })
})

describe('csrf', () => {
  it('accepts a matching double-submit token', () => {
    const request = new Request('http://localhost/api/auth/login', {
      headers: { cookie: 'csrf-token=abc123', 'x-csrf-token': 'abc123' },
    })
    assert.equal(verifyCsrfToken(request), true)
  })

  it('rejects a missing or mismatched token', () => {
    const request = new Request('http://localhost/api/auth/login', {
      headers: { cookie: 'csrf-token=abc123', 'x-csrf-token': 'other' },
    })
    assert.equal(verifyCsrfToken(request), false)
  })
})

describe('rate limiter', () => {
  it('blocks the request after the limit', () => {
    const limiter = new RateLimiter(2, 60_000)
    assert.equal(limiter.check('10.0.0.1').success, true)
    assert.equal(limiter.check('10.0.0.1').success, true)
    assert.equal(limiter.check('10.0.0.1').success, false)
    assert.equal(limiter.check('10.0.0.2').success, true)
  })
})

describe('sessions', () => {
  it('rejects a tampered or expired token', async () => {
    process.env.AUTH_SECRET = 'test-secret'
    const { createSession, verifySession } = await import('../src/lib/session')
    const token = createSession('user-1')
    assert.equal(verifySession(token)?.id, 'user-1')
    assert.equal(verifySession(`${token}x`), null)
    const expired = createSession('user-1', Date.now() - 8 * 24 * 60 * 60 * 1000)
    assert.equal(verifySession(expired), null)
  })
})
