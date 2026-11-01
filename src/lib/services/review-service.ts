import { db } from '@/lib/db'

export interface CreateReviewInput {
  name: string
  role: string
  content: string
  rating: number
  lawyerId?: string
}

export async function getReviews() {
  const reviews = await db.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: 'desc' },
  })
  return reviews
}

export async function createReview(data: CreateReviewInput) {
  const review = await db.review.create({
    data: {
      name: data.name,
      role: data.role,
      content: data.content,
      rating: data.rating,
      lawyerId: data.lawyerId || null,
    },
  })
  return review
}

export async function updateReview(id: string, data: { approved?: boolean }) {
  const review = await db.review.update({
    where: { id },
    data,
  })
  return review
}

export async function deleteReview(id: string) {
  await db.review.delete({ where: { id } })
}
