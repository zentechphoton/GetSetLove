'use client'

import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, Bars3Icon, PlusIcon, SwatchIcon, UserIcon, UserGroupIcon, HashtagIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { SwatchIcon as SwatchIconSolid } from '@heroicons/react/24/solid'
import ChatAvatar from './ChatAvatar'
import ChatSidebarHistory from './ChatSidebarHistory'
import ThemeSelector from './ThemeSelector'
import { getAllThemes, getStoredTheme, getTheme, applyTheme, chatThemes } from '@/lib/chat-themes'
import { formatDistanceToNow } from 'date-fns'

interface ChatSidebarProps {
  chats: any[]
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  collapsed: boolean
  width: number
  onToggleCollapse: () => void
  onResize: (width: number) => void
  loading?: boolean
  currentUserId?: string
}

export default function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  collapsed,
  width,
  onToggleCollapse,
  onResize,
  loading,
  currentUserId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme())
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const participant = currentUserId 
      ? chat.participants?.find((p: any) => p.user?.id !== currentUserId)
      : chat.participants?.[0]
    const userName = participant?.user?.username || participant?.user?.first_name || ''
    return userName.toLowerCase().includes(query)
  })

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return

      const newWidth = Math.min(Math.max(80, e.clientX - sidebarRef.current.offsetLeft), 480)
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onResize])

  const getOtherParticipant = (chat: any) => {
    if (!currentUserId) {
      // If no currentUserId, return first participant
      return chat.participants?.[0]?.user
    }
    // Get the first participant that is not the current user
    return chat.participants?.find((p: any) => p.user?.id !== currentUserId)?.user || chat.participants?.[0]?.user
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      // If today, show time (HH:mm)
      if (diffDays === 0) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }
      // If yesterday
      if (diffDays === 1) {
        return 'Yesterday'
      }
      // If this week, show day name
      if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      }
      // Otherwise show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  if (collapsed && width < 80) {
    return (
      <div
        ref={sidebarRef}
        className="flex flex-col border-r"
        style={{
          width: '80px',
          backgroundColor: 'var(--chat-bg-secondary)',
          borderColor: 'var(--chat-border)',
        }}
      >
        <div className="p-2 flex flex-col gap-2 overflow-y-auto">
          {filteredChats.map((chat) => {
            const participant = getOtherParticipant(chat)
            const unreadCount = chat.participants?.find((p: any) => p.user.id === chat.currentUserId)?.unreadCount || 0

            return (
              <div key={chat.id} className="relative">
                <ChatAvatar
                  user={participant}
                  size="md"
                  online={true}
                  unreadCount={unreadCount > 0 ? unreadCount : undefined}
                  className="cursor-pointer"
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col border-r relative w-full md:w-auto"
      style={{
        width: collapsed ? '80px' : width < 200 ? '200px' : `${width}px`,
        minWidth: collapsed ? '80px' : '200px',
        maxWidth: collapsed ? '80px' : '400px',
        backgroundColor: 'var(--chat-bg-secondary)',
        borderColor: 'var(--chat-border)',
        transition: isResizing ? 'none' : 'width 0.2s ease',
      }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-500 z-10"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Header */}
      <div 
        className="h-16 md:h-18 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between border-b flex-shrink-0" 
        style={{ 
          borderColor: 'var(--chat-border)',
          backgroundColor: 'var(--chat-bg-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          {width > 160 ? (
            <span className="font-semibold text-sm" style={{ color: 'var(--chat-text)' }}>GET SET LOVE</span>
          ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {width > 160 && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showThemeSelector ? 'bg-purple-100 dark:bg-purple-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={{ color: showThemeSelector ? 'var(--chat-primary)' : 'var(--chat-text-secondary)' }}
                  title="Themes"
                >
                  {showThemeSelector ? (
                    <SwatchIconSolid className="w-5 h-5" />
                  ) : (
                    <SwatchIcon className="w-5 h-5" />
                  )}
                </button>
                {showThemeSelector && (
                  <div className="fixed inset-0 z-[9997]">
                    <ThemeSelector
                      themes={chatThemes}
                      currentTheme={currentTheme}
                      onSelectTheme={(key) => {
                        setCurrentTheme(key)
                        const theme = getTheme(key)
                        applyTheme(theme)
                        setShowThemeSelector(false)
                        // Notify chat page
                        window.dispatchEvent(new CustomEvent('theme-changed', { detail: key }))
                      }}
                      onClose={() => setShowThemeSelector(false)}
                      onCreateCustomTheme={() => {
                        alert('Custom theme creator coming soon!')
                        setShowThemeSelector(false)
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'var(--chat-text-secondary)' }}
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--chat-text-secondary)' }}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stories Section */}
      {width > 200 && <ChatSidebarHistory chats={chats.slice(0, 5)} currentUserId={currentUserId} />}

      {/* Search Bar */}
      {(!collapsed && width > 160) && (
        <div 
          className="px-3 md:px-4 py-2 md:py-3 border-b flex-shrink-0" 
          style={{ 
            borderColor: 'var(--chat-border)',
            backgroundColor: 'var(--chat-bg-secondary)',
          }}
        >
          <div className="relative">
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
              style={{ color: 'var(--chat-text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-2.5 rounded-lg text-xs md:text-sm border focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                borderColor: 'var(--chat-border)',
                backgroundColor: 'var(--chat-bg)',
                color: 'var(--chat-text)',
              }}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded p-1"
              style={{ 
                color: 'var(--chat-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--chat-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div 
        className="flex-1 overflow-y-auto" 
        style={{ 
          scrollbarWidth: 'thin',
          backgroundColor: 'var(--chat-bg-secondary)',
        }}
      >
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
            {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const participant = getOtherParticipant(chat)
            // Get current user participant (first one for now, in real app get from auth)
            const currentUserParticipant = currentUserId 
              ? chat.participants?.find((p: any) => p.user?.id === currentUserId)
              : chat.participants?.[0]
            const unreadCount = currentUserParticipant?.unreadCount || 0
            const isSelected = chat.id === selectedChatId
            const lastMessage = chat.lastMessage

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="px-3 md:px-4 py-2.5 md:py-3 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? 'var(--chat-active)' : 'transparent',
                  borderLeft: isSelected ? `3px solid var(--chat-primary)` : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--chat-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <ChatAvatar
                    user={participant}
                    size="md"
                    online={true}
                    unreadCount={unreadCount > 0 ? unreadCount : undefined}
                  />
                  {(!collapsed && width > 200) && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 md:mb-1 gap-1 md:gap-2">
                        <span className="font-semibold text-xs md:text-sm truncate" style={{ color: 'var(--chat-text)' }}>
                          {participant?.first_name || participant?.username || 'Unknown'}
                        </span>
                        {lastMessage?.createdAt && (
                          <span className="text-[10px] md:text-xs ml-1 md:ml-2 flex-shrink-0" style={{ color: 'var(--chat-text-secondary)' }}>
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 md:gap-2">
                        <p className="text-xs md:text-sm truncate flex-1" style={{ color: 'var(--chat-text-secondary)' }}>
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span
                            className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white flex-shrink-0 min-w-[16px] md:min-w-[20px] text-center"
                            style={{ backgroundColor: 'var(--chat-unread)' }}
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Navigation - Icons */}
      {(!collapsed && width > 200) && (
        <div 
          className="h-10 md:h-12 px-2 md:px-4 border-t flex items-center justify-around flex-shrink-0" 
          style={{ 
            borderColor: 'var(--chat-border)',
            backgroundColor: 'var(--chat-bg-secondary)',
          }}
        >
          {[
            { Icon: UserIcon, title: 'Users' },
            { Icon: UserGroupIcon, title: 'Groups' },
            { Icon: HashtagIcon, title: 'Channels' },
            { Icon: EllipsisVerticalIcon, title: 'More' },
          ].map(({ Icon, title }, index) => (
            <button
              key={index}
              className="p-1.5 md:p-2 rounded transition-colors"
              style={{
                color: 'var(--chat-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--chat-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title={title}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

