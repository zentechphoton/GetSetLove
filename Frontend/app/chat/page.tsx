'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getWebSocketClient } from '@/lib/websocket-client'
import { getStoredTheme, applyTheme, getTheme } from '@/lib/chat-themes'
import NavigationRail from '@/components/Chat/NavigationRail'
import ChatSidebar from '@/components/Chat/ChatSidebar'
import MainChatWindow from '@/components/Chat/MainChatWindow'
import ChatInfoPanel from '@/components/Chat/ChatInfoPanel'
import { useAuthStore } from '@/store/authStore'

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme())
  const { user } = useAuthStore()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  // Apply theme immediately on mount and when theme changes
  useEffect(() => {
    const theme = getTheme(currentTheme)
    applyTheme(theme)
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      // Ensure all CSS variables are set
      root.style.setProperty('--chat-bg', theme.colors.background)
      root.style.setProperty('--chat-bg-secondary', theme.colors.backgroundSecondary)
      root.style.setProperty('--chat-primary', theme.colors.primary)
      root.style.setProperty('--chat-text', theme.colors.text)
      root.style.setProperty('--chat-text-secondary', theme.colors.textSecondary)
      root.style.setProperty('--chat-border', theme.colors.border)
      root.style.setProperty('--chat-message-sent', theme.colors.messageSent)
      root.style.setProperty('--chat-message-received', theme.colors.messageReceived)
      root.style.setProperty('--chat-online', theme.colors.online)
      root.style.setProperty('--chat-unread', theme.colors.unread)
      root.style.setProperty('--chat-hover', theme.colors.hover)
      root.style.setProperty('--chat-active', theme.colors.active)
      // Apply to body and html for full coverage
      document.body.style.backgroundColor = theme.colors.background
      document.documentElement.style.backgroundColor = theme.colors.background
    }
  }, [currentTheme])

  const fetchChats = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      console.log('🔵 Fetching chats for user:', user.id)
      const response = await api.get('/user/messages')
      console.log('📦 API Response:', response.data)
      console.log('📦 Full response JSON:', JSON.stringify(response.data, null, 2))
      const chatsData = response.data.chats || []
      console.log('📊 Parsed chats:', chatsData.length, 'chats')
      chatsData.forEach((chat: any, index: number) => {
        console.log(`  Chat ${index + 1}:`, {
          id: chat.id,
          type: chat.type,
          participants: chat.participants?.length || 0,
          participantNames: chat.participants?.map((p: any) => p.user?.username || p.user?.first_name || 'Unknown').join(', ') || 'None'
        })
      })
      setChats(chatsData)
      console.log('✅ Chats loaded:', chatsData.length, 'chats')
      if (chatsData.length > 0) {
        console.log('Chat IDs:', chatsData.map((c: any) => c.id))
        console.log('First chat details:', JSON.stringify(chatsData[0], null, 2))
      } else {
        console.log('⚠️ No chats found - checking if match exists...')
      }
    } catch (err: any) {
      console.error('❌ Error loading chats:', err)
      console.error('Error details:', err.response?.data)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchChats()
      // Poll every 5 seconds
      const interval = setInterval(fetchChats, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Listen for theme changes from NavigationRail
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail)
    }
    window.addEventListener('theme-changed', handleThemeChange as EventListener)
    return () => window.removeEventListener('theme-changed', handleThemeChange as EventListener)
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return

    const wsClient = getWebSocketClient()
    
    wsClient.connect().catch((error) => {
      console.error('Failed to connect WebSocket:', error)
    })

    // Listen for new messages
    const unsubscribe = wsClient.on('message.received', (data: any) => {
      fetchChats()
    })

    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [user])

  const handleThemeChange = (themeKey: string) => {
    setCurrentTheme(themeKey)
    const theme = getTheme(themeKey)
    applyTheme(theme)
  }

  const selectedChat = chats.find((chat: any) => chat.id === selectedChatId)

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--chat-bg)' }}>
      {/* Navigation Rail - Hidden on mobile */}
      <div className="hidden md:flex">
        <NavigationRail />
      </div>

      {/* Chat Sidebar - Responsive */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} flex-shrink-0 transition-all duration-300`}>
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(chatId) => {
            setSelectedChatId(chatId)
            // On mobile, hide sidebar when chat is selected
            if (window.innerWidth < 768) {
              setSidebarCollapsed(true)
            }
          }}
          collapsed={sidebarCollapsed}
          width={sidebarWidth}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onResize={setSidebarWidth}
          loading={loading}
          currentUserId={user?.id}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 w-full md:w-auto">
        {selectedChat ? (
          <MainChatWindow
            chat={selectedChat}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onToggleInfoPanel={() => setInfoPanelOpen(!infoPanelOpen)}
            onThemeChange={handleThemeChange}
            currentTheme={currentTheme}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-green-50 dark:bg-slate-900">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-24 h-24 mx-auto text-green-300 dark:text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Select a chat to start messaging</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose a conversation from the sidebar</p>
              {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Error loading chats: {error.message}
                  </p>
                  <button
                    onClick={() => fetchChats()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Panel */}
      {selectedChat && infoPanelOpen && (
        <ChatInfoPanel
          chat={selectedChat}
          onClose={() => setInfoPanelOpen(false)}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}

