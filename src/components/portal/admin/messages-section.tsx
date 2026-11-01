'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, Search, MessageCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { api, initials, timeAgo, formatDateTime } from '@/lib/helpers'
import type { Message } from '@/lib/types'
import { SectionHeader } from './section-header'

interface ClientRow {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  avatar: string | null
}

export function MessagesSection() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [activeClient, setActiveClient] = useState<ClientRow | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesForId, setMessagesForId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    api<{ cases: { client?: ClientRow }[] }>('/api/cases')
      .then(({ cases }) => {
        if (cancelled) return
        const people = new Map<string, ClientRow>()
        for (const matter of cases ?? []) {
          if (matter.client) people.set(matter.client.id, matter.client)
        }
        setClients([...people.values()])
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load clients') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const activeClientId = activeClient?.id ?? null
  // Only show messages that belong to the currently active client
  const visibleMessages = messagesForId === activeClientId ? messages : []

  const loadMessages = useCallback(async (partnerId: string) => {
    const { messages } = await api<{ messages: Message[] }>(`/api/messages?partnerId=${partnerId}`)
    return messages
  }, [])

  useEffect(() => {
    if (!activeClientId) return
    let cancelled = false
    loadMessages(activeClientId)
      .then((msgs) => {
        if (cancelled) return
        setMessages(msgs)
        setMessagesForId(activeClientId)
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load messages') })
    return () => { cancelled = true }
  }, [activeClientId, loadMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleMessages])

  // Poll for new messages every 8 seconds
  useEffect(() => {
    if (!activeClientId) return
    const interval = setInterval(() => {
      loadMessages(activeClientId)
        .then((msgs) => {
          setMessages(msgs)
          setMessagesForId(activeClientId)
        })
        .catch(() => {})
    }, 8000)
    return () => clearInterval(interval)
  }, [activeClientId, loadMessages])

  const handleSend = () => {
    if (!draft.trim() || !activeClient) return
    setSending(true)
    api<{ message: Message }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId: activeClient.id, content: draft.trim() }),
    })
      .then(({ message }) => {
        setMessages((prev) => [...prev, message])
        setDraft('')
      })
      .catch(() => toast.error('Failed to send message'))
      .finally(() => setSending(false))
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <SectionHeader
        title="Messages"
        subtitle="Direct messaging with clients"
        icon={<MessageSquare className="h-5 w-5" />}
        showBookButton={false}
      />

      <div className="flex min-h-0 flex-1 p-4 sm:p-6">
        <Card className="flex w-full overflow-hidden">
          <div className="flex w-full">
            {/* Client list */}
            <div
              className={`flex flex-col border-r border-border ${mobileShowChat ? 'hidden w-full md:flex md:w-80' : 'flex w-full md:w-80'}`}
            >
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="h-9 pl-9"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">No clients found.</p>
                ) : (
                  <div className="space-y-0.5 p-2">
                    {filteredClients.map((c) => {
                      const isActive = activeClient?.id === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveClient(c)
                            setMobileShowChat(true)
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${
                            isActive ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                        >
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Conversation */}
            <div
              className={`flex flex-1 flex-col ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}
            >
              {activeClient ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-border p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:hidden"
                      onClick={() => setMobileShowChat(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {initials(activeClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{activeClient.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{activeClient.email}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                    {visibleMessages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <MessageCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground">Start the conversation below.</p>
                      </div>
                    ) : (
                      visibleMessages.map((m) => {
                        const isMe = m.senderId !== activeClient.id
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                                isMe
                                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                                  : 'rounded-bl-sm bg-card text-foreground border border-border'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}
                                title={formatDateTime(m.createdAt)}
                              >
                                {timeAgo(m.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Composer */}
                  <div className="border-t border-border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="Type a message..."
                        className="h-10"
                      />
                      <Button
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={handleSend}
                        disabled={sending || !draft.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-serif text-lg font-semibold text-foreground">Select a client</p>
                  <p className="text-sm text-muted-foreground">Choose a client from the list to view your conversation.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
