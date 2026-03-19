'use client'

import { useMemo } from 'react'

interface ChatAvatarProps {
  user?: {
    id: string
    username?: string
    first_name?: string
    last_name?: string
    avatar?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  unreadCount?: number
  className?: string
}

export default function ChatAvatar({ user, size = 'md', online, unreadCount, className = '' }: ChatAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = () => {
    if (!user) return '?'
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const username = user.username || ''

    if (firstName || lastName) {
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || username[0]?.toUpperCase() || '?'
    }
    return username[0]?.toUpperCase() || '?'
  }

  const avatarUrl = user?.avatar

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden ${avatarUrl ? 'ring-2 ring-offset-2' : ''
          }`}
        style={{
          borderColor: online ? 'var(--chat-online)' : 'transparent',
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.username || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      {/* Online Status Indicator */}
      {online !== undefined && (
        <div
          className={`absolute bottom-0 right-0 rounded-full border-2 ${size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
            }`}
          style={{
            backgroundColor: online ? 'var(--chat-online)' : 'var(--chat-offline)',
            borderColor: 'var(--chat-bg)',
          }}
        />
      )}

      {/* Unread Badge */}
      {unreadCount !== undefined && unreadCount > 0 && (
        <div
          className="absolute -top-1 -right-1 rounded-full flex items-center justify-center text-white text-xs font-bold min-w-[20px] px-1.5 py-0.5"
          style={{ backgroundColor: 'var(--chat-unread)' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  )
}

