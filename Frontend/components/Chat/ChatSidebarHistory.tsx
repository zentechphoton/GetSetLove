'use client'

import { useRef, useState } from 'react'
import ChatAvatar from './ChatAvatar'

interface ChatSidebarHistoryProps {
  chats: any[]
  currentUserId?: string
}

export default function ChatSidebarHistory({ chats, currentUserId }: ChatSidebarHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getOtherParticipant = (chat: any) => {
    if (!currentUserId) {
      return chat.participants?.[0]?.user
    }
    return chat.participants?.find((p: any) => p.user?.id !== currentUserId)?.user || chat.participants?.[0]?.user
  }

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--chat-border)' }}>
      <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--chat-text-secondary)' }}>
        Stories
      </h3>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chats.map((chat) => {
          const participant = getOtherParticipant(chat)

          return (
            <div key={chat.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className="relative p-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--chat-primary), var(--chat-secondary))',
                }}
              >
                <ChatAvatar user={participant} size="lg" online={true} />
              </div>
              <span className="text-xs truncate max-w-[60px]" style={{ color: 'var(--chat-text-secondary)' }}>
                {participant?.first_name || participant?.username || 'Unknown'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

