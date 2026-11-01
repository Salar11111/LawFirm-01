export function readPage(searchParams: URLSearchParams, fallbackSize = 10) {
  if (!searchParams.has('page')) return null
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || fallbackSize))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}
