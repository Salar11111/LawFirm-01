'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { api, initials } from '@/lib/helpers'
import type { Review } from '@/lib/types'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ reviews: Review[] }>('/api/reviews').then(({ reviews }) => setReviews(reviews)).finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-muted-foreground">
            The trust our clients place in us is our greatest achievement. Here are some of their stories.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-12">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {reviews.map((review, i) => (
                  <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="h-full"
                    >
                      <Card className="flex h-full flex-col p-6">
                        <Quote className="h-8 w-8 text-accent/40" />
                        <div className="mt-3 flex gap-0.5">
                          {[...Array(review.rating)].map((_, idx) => (
                            <Star key={idx} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                          &ldquo;{review.content}&rdquo;
                        </p>
                        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 font-medium text-primary">
                              {initials(review.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.role}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  )
}
