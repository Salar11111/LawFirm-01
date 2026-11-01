'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { api, initials, formatDateTime, timeAgo } from '@/lib/helpers'
import type { User, Message } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  MessageSquare,
  ArrowLeft,
  Search,
  Scale,
  Loader2,
  Mailbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadError } from '@/components/portal/load-error'
import { toast } from 'sonner'

export function MessagesSection() {
  const user = useAppStore((s) => s.user)

  const [team, setTeam] = useState<User[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  const [teamError, setTeamError] = useState(false)
  const [teamAttempt, setTeamAttempt] = useState(0)
  const [msgError, setMsgError] = useState(false)
  const [msgAttempt, setMsgAttempt] = useState(0)

  // Fetch team list once
  useEffect(() => {
    let cancelled = false
    setTeamLoading(true)
    setTeamError(false)
    api<{ cases: { lawyer?: User }[] }>('/api/cases')
      .then(({ cases }) => {
        if (cancelled) return
        const lawyers = new Map<string, User>()
        for (const matter of cases ?? []) {
          if (matter.lawyer) lawyers.set(matter.lawyer.id, matter.lawyer)
        }
        const list = [...lawyers.values()]
        setTeam(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) setTeamError(true)
      })
      .finally(() => {
        if (!cancelled) setTeamLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [teamAttempt])

  // Fetch messages when partner changes
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setMsgsLoading(true)
    setMsgError(false)
    api<{ messages: Message[] }>(`/api/messages?partnerId=${selectedId}`)
      .then(({ messages: m }) => {
        if (!cancelled) setMessages(m ?? [])
      })
      .catch(() => {
        if (!cancelled) setMsgError(true)
      })
      .finally(() => {
        if (!cancelled) setMsgsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, msgAttempt])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, msgsLoading])

  const selectedPartner = team.find((t) => t.id === selectedId)

  const filteredTeam = team.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      (t.specialization ?? '').toLowerCase().includes(q)
    )
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !selectedId || !user) return
    setSending(true)
    setDraft('')
    try {
      const { message } = await api<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: selectedId, content: text }),
      })
      setMessages((prev) => [...prev, message])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const showConversationMobile = !!selectedId

  return (
    <Card className="flex h-[calc(100vh-13rem)] min-h-[520px] gap-0 overflow-hidden p-0">
      {/* Left: lawyer list */}
      <aside
        className={cn(
          'flex w-full flex-col border-r border-border bg-card/50 sm:w-72 lg:w-80',
          showConversationMobile && 'hidden sm:flex',
        )}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-base font-semibold text-foreground">Messages</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Chat with your legal team</p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lawyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ul className="p-2">
            {teamLoading ? (
              [0, 1, 2].map((i) => (
                <li key={i} className="p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                </li>
              ))
            ) : teamError ? (
              <li>
                <LoadError
                  title="Lawyers could not be loaded"
                  onRetry={() => setTeamAttempt((n) => n + 1)}
                />
              </li>
            ) : filteredTeam.length === 0 ? (
              <li className="px-3 py-8 text-center text-xs text-muted-foreground">No lawyers found.</li>
            ) : (
              filteredTeam.map((t) => {
                const active = t.id === selectedId
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                        active ? 'bg-primary/10' : 'hover:bg-muted',
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-border">
                          {t.avatar ? <AvatarImage src={t.avatar} alt={t.name} /> : null}
                          <AvatarFallback className={cn('text-[11px] font-semibold', active ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary')}>
                            {initials(t.name)}
                          </AvatarFallback>
                        </Avatar>
                        {t.active && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" aria-label="Available" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={cn('truncate text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>{t.name}</p>
                          {t.role === 'ADMIN' && (
                            <Badge variant="outline" className="border-accent/40 px-1 py-0 text-[8px] uppercase text-accent-foreground">Admin</Badge>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">{t.specialization ?? 'Legal Counsel'}</p>
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </ScrollArea>
      </aside>

      {/* Right: conversation */}
      <section
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          !showConversationMobile && 'hidden sm:flex',
        )}
      >
        {selectedPartner ? (
          <>
            {/* Conversation header */}
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:hidden"
                onClick={() => setSelectedId(null)}
                aria-label="Back to lawyers"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10 border border-border">
                {selectedPartner.avatar ? <AvatarImage src={selectedPartner.avatar} alt={selectedPartner.name} /> : null}
                <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials(selectedPartner.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{selectedPartner.name}</p>
                <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <Scale className="h-3 w-3 text-accent" />
                  {selectedPartner.specialization ?? 'Legal Counsel'}
                  {selectedPartner.active && <span className="text-emerald-600">· Available</span>}
                </p>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin bg-muted/20 p-4">
              {msgsLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                      <Skeleton className={cn('h-12 w-48 rounded-2xl', i % 2 === 0 ? 'rounded-bl-sm' : 'rounded-br-sm')} />
                    </div>
                  ))}
                </div>
              ) : msgError ? (
                <LoadError
                  title="Messages could not be loaded"
                  onRetry={() => setMsgAttempt((n) => n + 1)}
                />
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mailbox className="h-7 w-7" />
                  </span>
                  <p className="mt-3 font-serif text-base font-semibold text-foreground">No messages yet</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Start a conversation with {selectedPartner.name}. Your messages are private and secure.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
                    Conversation started
                  </p>
                  {messages.map((m, idx) => {
                    const isMine = m.senderId === user?.id
                    const prev = messages[idx - 1]
                    const showDate = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString()
                    return (
                      <div key={m.id}>
                        {showDate && (
                          <div className="my-3 flex items-center gap-2">
                            <Separator className="flex-1 bg-border" />
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {new Date(m.createdAt).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                            <Separator className="flex-1 bg-border" />
                          </div>
                        )}
                        <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
                          {!isMine && (
                            <Avatar className="h-6 w-6 border border-border">
                              {selectedPartner.avatar ? <AvatarImage src={selectedPartner.avatar} alt={selectedPartner.name} /> : null}
                              <AvatarFallback className="bg-primary/15 text-[8px] font-semibold text-primary">
                                {initials(selectedPartner.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]',
                              isMine
                                ? 'rounded-br-sm bg-primary text-primary-foreground'
                                : 'rounded-bl-sm bg-card text-card-foreground border border-border',
                            )}
                          >
                            <p className="whitespace-pre-line break-words leading-relaxed">{m.content}</p>
                            <p className={cn('mt-1 text-[9px]', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                              {new Date(m.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                              {!isMine && !m.read && <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-accent" />}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <p className="pt-1 text-center text-[10px] text-muted-foreground/70">
                    Last message {timeAgo(messages[messages.length - 1].createdAt)}
                  </p>
                </>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-card p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${selectedPartner.name.split(' ')[0]}...`}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!draft.trim() || sending} aria-label="Send message">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
            </span>
            <p className="mt-4 font-serif text-lg font-semibold text-foreground">Select a lawyer to chat</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Choose a member of our legal team from the list to start a conversation.
            </p>
          </div>
        )}
      </section>
    </Card>
  )
}
