'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import api from '@/lib/api'
import {
  Bars3Icon,
  PhoneIcon,
  VideoCameraIcon,
  SwatchIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { getWebSocketClient } from '@/lib/websocket-client'
import ChatAvatar from './ChatAvatar'
import ChatMessage from './ChatMessage'
import ChatMessageInput from './ChatMessageInput'
import ThemeSelector from './ThemeSelector'
import { chatThemes } from '@/lib/chat-themes'
import { useAuthStore } from '@/store/authStore'

interface MainChatWindowProps {
  chat: any
  onToggleSidebar: () => void
  onToggleInfoPanel: () => void
  onThemeChange: (themeKey: string) => void
  currentTheme: string
}

export default function MainChatWindow({
  chat,
  onToggleSidebar,
  onToggleInfoPanel,
  onThemeChange,
  currentTheme,
}: MainChatWindowProps) {
  const { user } = useAuthStore()
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsClient = getWebSocketClient()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    if (!chat?.id) return
    
    try {
      setLoading(true)
      console.log('🔵 Fetching messages for chat:', chat.id)
      // Use REST API endpoint for messages
      const response = await api.get(`/chat/${chat.id}/messages?limit=50`)
      console.log('📦 Messages response:', response.data)
      const messagesData = response.data.messages || []
      setMessages(messagesData.reverse()) // Reverse to show oldest first
      console.log('✅ Loaded', messagesData.length, 'messages')
      
      // Scroll to bottom after loading
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      console.error('❌ Error fetching messages:', err)
      console.error('Error details:', err.response?.data)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [chat?.id])

  useEffect(() => {
    if (chat?.id) {
      fetchMessages()
    }
  }, [chat?.id, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (messages.length > 0 && user && chat?.id) {
      const unreadMessages = messages
        .filter((msg: any) => msg.senderID !== user.id && msg.status !== 'read')
        .map((msg: any) => msg.id)

      if (unreadMessages.length > 0) {
        // TODO: Implement REST API endpoint for marking messages as read
        // For now, just log
        console.log('Marking messages as read:', unreadMessages)
      }
    }
  }, [messages, chat?.id, user])

  // Subscribe to chat messages via WebSocket
  useEffect(() => {
    if (!chat?.id) return

    let unsubscribe: (() => void) | null = null

    // Wait for WebSocket connection and subscribe
    const connectAndSubscribe = async () => {
      if (!wsClient.isConnected()) {
        try {
          await wsClient.connect()
        } catch (error) {
          console.error('Failed to connect WebSocket:', error)
          return
        }
      }

      wsClient.subscribeToChat(chat.id)
      console.log('✅ Subscribed to chat:', chat.id)

      unsubscribe = wsClient.on('message.received', (data: any) => {
        console.log('📨 WebSocket message received:', data)
        if (data.chat_id === chat.id || data.message?.chatID === chat.id) {
          console.log('✅ Message is for current chat, refreshing...')
          fetchMessages()
        } else {
          console.log('⚠️ Message is for different chat, ignoring')
        }
      })
      
      // Also listen for message.sent events for real-time updates
      const sentUnsubscribe = wsClient.on('message.sent', (data: any) => {
        console.log('📤 WebSocket message sent event:', data)
        if (data.chat_id === chat.id || data.message?.chatID === chat.id) {
          console.log('✅ Sent message confirmed, refreshing...')
          fetchMessages()
        }
      })
      
      // Store both unsubscribe functions
      const originalUnsubscribe = unsubscribe
      unsubscribe = () => {
        if (originalUnsubscribe) originalUnsubscribe()
        if (sentUnsubscribe) sentUnsubscribe()
      }
    }

    connectAndSubscribe()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (chat.id) {
        wsClient.unsubscribeFromChat(chat.id)
      }
    }
  }, [chat.id, wsClient, fetchMessages])

  const getOtherParticipant = () => {
    if (!user?.id) {
      return chat.participants?.[0]?.user
    }
    return chat.participants?.find((p: any) => p.user?.id !== user.id)?.user || chat.participants?.[0]?.user
  }

  const otherParticipant = getOtherParticipant()

  const handleSendMessage = async (content: string, mediaURL?: string, replyTo?: string) => {
    if (!content.trim() && !mediaURL) return

    // Ensure WebSocket is connected
    if (!wsClient.isConnected()) {
      try {
        await wsClient.connect()
      } catch (error) {
        console.error('Failed to connect WebSocket for sending message:', error)
        return
      }
    }

    const tempID = `temp-${Date.now()}-${Math.random()}`
    wsClient.sendChatMessage(chat.id, content, tempID, mediaURL, replyTo)

    // Optimistically update UI - refresh messages after sending
    setTimeout(() => fetchMessages(), 500)
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--chat-bg)' }}>
      {/* Header */}
      <div
        className="h-16 md:h-18 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between border-b flex-shrink-0"
        style={{ borderColor: 'var(--chat-border)', backgroundColor: 'var(--chat-bg-secondary)' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => {
              onToggleSidebar()
              // On mobile, also clear selected chat to show sidebar
              if (window.innerWidth < 768) {
                // This will be handled by parent component
              }
            }}
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="Back to chats"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleSidebar}
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden md:block"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <ChatAvatar user={otherParticipant} size="md" online={true} />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate" style={{ color: 'var(--chat-text)' }}>
              {otherParticipant?.first_name || otherParticipant?.username || 'Unknown'}
            </h3>
            <p className="text-[10px] md:text-xs" style={{ color: 'var(--chat-text-secondary)' }}>
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 md:gap-1">
          <button
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:block"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="Phone Call"
          >
            <PhoneIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:block"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="Video Call"
          >
            <VideoCameraIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              style={{ color: 'var(--chat-text-secondary)' }}
              title="Theme Selector"
            >
              <SwatchIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {showThemeSelector && (
              <div className="fixed inset-0 z-[9997]">
                <ThemeSelector
                  themes={chatThemes}
                  currentTheme={currentTheme}
                  onSelectTheme={(themeKey) => {
                    onThemeChange(themeKey)
                    setShowThemeSelector(false)
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
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden lg:block"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="Screen Share"
          >
            <ComputerDesktopIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onToggleInfoPanel}
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--chat-text-secondary)' }}
            title="More Options"
          >
            <EllipsisVerticalIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4" 
        style={{ 
          scrollbarWidth: 'thin',
          backgroundColor: 'var(--chat-bg)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--chat-text-secondary)' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--chat-text-secondary)' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any, index: number) => {
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showDateDivider =
                !prevMessage ||
                new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString()

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: 'var(--chat-bg-secondary)',
                          color: 'var(--chat-text-secondary)',
                        }}
                      >
                        {new Date(message.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  <ChatMessage 
                    message={message} 
                    isOwn={message.senderID === user?.id || message.sender?.id === user?.id} 
                  />
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <ChatMessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

