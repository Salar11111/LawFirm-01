'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { api, timeAgo } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Notice {
  id: string
  title: string
  body: string
  href: string | null
  read: boolean
}

export function NoticeList() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    let cancelled = false
    api<{ notices: Notice[] }>('/api/notices')
      .then(({ notices: rows }) => {
        if (!cancelled) setNotices(rows.filter((notice) => !notice.read).slice(0, 4))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (notices.length === 0) return null

  const open = async (notice: Notice) => {
    await api('/api/notices', { method: 'PATCH', body: JSON.stringify({ id: notice.id }) }).catch(() => {})
    setNotices((current) => current.filter((item) => item.id !== notice.id))
    if (notice.href) router.push(notice.href)
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Notices</h3>
      </div>
      <ul className="space-y-2">
        {notices.map((notice) => (
          <li key={notice.id}>
            <button type="button" onClick={() => open(notice)} className="w-full rounded-lg px-2 py-2 text-left hover:bg-muted">
              <p className="text-sm font-semibold text-foreground">{notice.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notice.body}</p>
            </button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => {
          api('/api/notices', { method: 'PATCH', body: JSON.stringify({ all: true }) }).catch(() => {})
          setNotices([])
        }}
      >
        Mark all read
      </Button>
    </Card>
  )
}

export function AuditFeed() {
  const [events, setEvents] = useState<{ id: string; summary: string; createdAt: string }[]>([])

  useEffect(() => {
    let cancelled = false
    api<{ events: { id: string; summary: string; createdAt: string }[] }>('/api/audit')
      .then(({ events: rows }) => { if (!cancelled) setEvents(rows.slice(0, 6)) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (events.length === 0) return null

  return (
    <Card className="p-4">
      <h3 className="font-serif text-lg font-semibold">Recent activity</h3>
      <ul className="mt-3 space-y-2">
        {events.map((event) => (
          <li key={event.id} className="text-sm">
            <p className="text-foreground">{event.summary}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(event.createdAt)}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
