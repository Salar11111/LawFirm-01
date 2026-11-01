export interface MatterRef {
  clientId: string
  lawyerId: string
}

export function canAccessMatter(role: string, userId: string, matter: MatterRef) {
  if (role === 'ADMIN') return true
  if (role === 'LAWYER') return matter.lawyerId === userId
  if (role === 'CLIENT') return matter.clientId === userId
  return false
}

export function canReadDocument(
  role: string,
  userId: string,
  document: { uploadedBy: string; case: MatterRef | null },
) {
  if (role === 'ADMIN') return true
  if (!document.case) return document.uploadedBy === userId && role !== 'CLIENT'
  return canAccessMatter(role, userId, document.case)
}

export function invoiceAmount(
  amount: number,
  items?: { quantity: number; unitPrice: number }[],
) {
  if (!items || items.length === 0) return amount
  const sum = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  return Math.round(sum * 100) / 100
}
