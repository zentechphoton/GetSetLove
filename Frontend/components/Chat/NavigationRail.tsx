'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { HomeIcon, UserGroupIcon, FolderIcon, BookmarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, UserGroupIcon as UserGroupIconSolid, FolderIcon as FolderIconSolid, BookmarkIcon as BookmarkIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from '@heroicons/react/24/solid'
import { ChatBubbleLeftRightIcon, SwatchIcon } from '@heroicons/react/24/outline'
import { SwatchIcon as SwatchIconSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '@/store/authStore'
import { getStoredTheme, getAllThemes, getTheme, applyTheme, chatThemes } from '@/lib/chat-themes'
import ThemeSelector from './ThemeSelector'

export default function NavigationRail() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [activeItem, setActiveItem] = useState('home')
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme())

  const navItems = [
    { id: 'home', icon: HomeIcon, iconSolid: HomeIconSolid, label: 'Home', path: '/dashboard' },
    { id: 'communities', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, label: 'Communities', path: '/communities' },
    { id: 'folders', icon: FolderIcon, iconSolid: FolderIconSolid, label: 'Folders', path: '/folders' },
    { id: 'saved', icon: BookmarkIcon, iconSolid: BookmarkIconSolid, label: 'Saved', path: '/saved' },
    { id: 'settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid, label: 'Settings', path: '/settings' },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveItem(item.id)
    router.push(item.path)
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-16 flex flex-col items-center py-4" style={{ backgroundColor: 'var(--chat-bg-secondary)' }}>
      {/* GET SET LOVE Logo */}
      <div className="mb-8 cursor-pointer" onClick={() => router.push('/dashboard')}>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          G
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = activeItem === item.id ? item.iconSolid : item.icon
          const isActive = activeItem === item.id || pathname === item.path

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
            </button>
          )
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-2 mb-4">
        <button
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            pathname === '/chat'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => router.push('/chat')}
          title="Chats"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              showThemeSelector
                ? 'bg-purple-600 text-white shadow-lg'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            title="Themes"
          >
            {showThemeSelector ? (
              <SwatchIconSolid className="w-6 h-6" />
            ) : (
              <SwatchIcon className="w-6 h-6" />
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
                  // Trigger theme change in chat page if on chat route
                  if (pathname === '/chat') {
                    window.dispatchEvent(new CustomEvent('theme-changed', { detail: key }))
                  }
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
      </div>

      {/* User Avatar */}
      <div className="mt-auto">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
          title={user?.username || 'User'}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-lg">{getInitials(user?.first_name || user?.username)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

