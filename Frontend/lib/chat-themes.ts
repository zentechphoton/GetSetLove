export type ChatTheme = {
  key: string
  name: string
  emoji: string
  description: string
  colors: {
    background: string
    backgroundSecondary: string
    primary: string
    primaryHover: string
    secondary: string
    text: string
    textSecondary: string
    border: string
    messageSent: string
    messageReceived: string
    online: string
    offline: string
    unread: string
    hover: string
    active: string
  }
}

export const chatThemes: ChatTheme[] = [
  {
    key: 'emerald',
    name: 'Emerald',
    emoji: '🌿',
    description: 'Fresh green, perfect for daytime reading',
    colors: {
      background: '#eafff2',
      backgroundSecondary: '#d1fae5',
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#10b981',
      text: '#064e3b',
      textSecondary: '#065f46',
      border: '#a7f3d0',
      messageSent: '#10b981',
      messageReceived: '#ffffff',
      online: '#10b981',
      offline: '#6b7280',
      unread: '#059669',
      hover: '#d1fae5',
      active: '#a7f3d0',
    },
  },
  {
    key: 'emnight',
    name: 'Emerald Night',
    emoji: '🌲',
    description: 'Dark emerald variant',
    colors: {
      background: '#022c22',
      backgroundSecondary: '#064e3b',
      primary: '#10b981',
      primaryHover: '#34d399',
      secondary: '#059669',
      text: '#d1fae5',
      textSecondary: '#a7f3d0',
      border: '#065f46',
      messageSent: '#10b981',
      messageReceived: '#064e3b',
      online: '#10b981',
      offline: '#6b7280',
      unread: '#10b981',
      hover: '#064e3b',
      active: '#065f46',
    },
  },
  {
    key: 'celeste',
    name: 'Celeste',
    emoji: '🌌',
    description: 'Calming blue, great for focus',
    colors: {
      background: '#f0f8ff',
      backgroundSecondary: '#dbeafe',
      primary: '#0052FF',
      primaryHover: '#003dbf',
      secondary: '#3b82f6',
      text: '#1e3a8a',
      textSecondary: '#1e40af',
      border: '#bfdbfe',
      messageSent: '#3b82f6',
      messageReceived: '#ffffff',
      online: '#3b82f6',
      offline: '#6b7280',
      unread: '#0052FF',
      hover: '#dbeafe',
      active: '#bfdbfe',
    },
  },
  {
    key: 'maya',
    name: 'Maya',
    emoji: '💜',
    description: 'Purple-blue gradient, vibrant and modern',
    colors: {
      background: '#faf5ff',
      backgroundSecondary: '#f3e8ff',
      primary: '#9333ea',
      primaryHover: '#7e22ce',
      secondary: '#3b82f6',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#e9d5ff',
      messageSent: '#9333ea',
      messageReceived: '#ffffff',
      online: '#9333ea',
      offline: '#6b7280',
      unread: '#9333ea',
      hover: '#f3e8ff',
      active: '#e9d5ff',
    },
  },
  {
    key: 'arctic',
    name: 'Arctic',
    emoji: '🧊',
    description: 'Cool teal/cyan theme',
    colors: {
      background: '#f0fdfa',
      backgroundSecondary: '#ccfbf1',
      primary: '#14b8a6',
      primaryHover: '#0d9488',
      secondary: '#2dd4bf',
      text: '#134e4a',
      textSecondary: '#155e75',
      border: '#99f6e4',
      messageSent: '#14b8a6',
      messageReceived: '#ffffff',
      online: '#14b8a6',
      offline: '#6b7280',
      unread: '#14b8a6',
      hover: '#ccfbf1',
      active: '#99f6e4',
    },
  },
  {
    key: 'mono',
    name: 'MonoChrome',
    emoji: '☯',
    description: 'Pure monochrome, distraction-free',
    colors: {
      background: '#1a1a1a',
      backgroundSecondary: '#2a2a2a',
      primary: '#e5e5e5',
      primaryHover: '#d4d4d4',
      secondary: '#a3a3a3',
      text: '#e5e5e5',
      textSecondary: '#a3a3a3',
      border: '#404040',
      messageSent: '#404040',
      messageReceived: '#2a2a2a',
      online: '#e5e5e5',
      offline: '#6b7280',
      unread: '#e5e5e5',
      hover: '#2a2a2a',
      active: '#404040',
    },
  },
  {
    key: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    description: 'Warm orange-yellow, evening comfort',
    colors: {
      background: '#fffbeb',
      backgroundSecondary: '#fef3c7',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      secondary: '#fbbf24',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
      messageSent: '#f59e0b',
      messageReceived: '#ffffff',
      online: '#f59e0b',
      offline: '#6b7280',
      unread: '#f59e0b',
      hover: '#fef3c7',
      active: '#fde68a',
    },
  },
  {
    key: 'sepia',
    name: 'Sepia',
    emoji: '📜',
    description: 'Classic book-like, vintage feel',
    colors: {
      background: '#faf8f1',
      backgroundSecondary: '#f5f1e8',
      primary: '#8d6e63',
      primaryHover: '#6d4c41',
      secondary: '#a1887f',
      text: '#3e2723',
      textSecondary: '#4e342e',
      border: '#d7ccc8',
      messageSent: '#8d6e63',
      messageReceived: '#ffffff',
      online: '#8d6e63',
      offline: '#6b7280',
      unread: '#8d6e63',
      hover: '#f5f1e8',
      active: '#d7ccc8',
    },
  },
  {
    key: 'coral',
    name: 'Coral Fushia',
    emoji: '🌺',
    description: 'Peachy-pink, warmer than Rose',
    colors: {
      background: '#fdf2f8',
      backgroundSecondary: '#fce7f3',
      primary: '#ec4899',
      primaryHover: '#db2777',
      secondary: '#f472b6',
      text: '#831843',
      textSecondary: '#9f1239',
      border: '#fbcfe8',
      messageSent: '#ec4899',
      messageReceived: '#ffffff',
      online: '#ec4899',
      offline: '#6b7280',
      unread: '#ec4899',
      hover: '#fce7f3',
      active: '#fbcfe8',
    },
  },
  {
    key: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    description: 'Deep purple/indigo for late night sessions',
    colors: {
      background: '#020617',
      backgroundSecondary: '#0f172a',
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      secondary: '#8b5cf6',
      text: '#e9d5ff',
      textSecondary: '#ddd6fe',
      border: '#1e1b4b',
      messageSent: '#7c3aed',
      messageReceived: '#1e1b4b',
      online: '#7c3aed',
      offline: '#6b7280',
      unread: '#7c3aed',
      hover: '#0f172a',
      active: '#1e1b4b',
    },
  },
  {
    key: 'rosegarden',
    name: 'Rosey',
    emoji: '🌹',
    description: 'Deep crimson and rose elegance',
    colors: {
      background: '#fff5f6',
      backgroundSecondary: '#ffe4e6',
      primary: '#F92A53',
      primaryHover: '#e11d48',
      secondary: '#fb7185',
      text: '#881337',
      textSecondary: '#9f1239',
      border: '#fecdd3',
      messageSent: '#F92A53',
      messageReceived: '#ffffff',
      online: '#F92A53',
      offline: '#6b7280',
      unread: '#F92A53',
      hover: '#ffe4e6',
      active: '#fecdd3',
    },
  },
  {
    key: 'storm',
    name: 'Storm',
    emoji: '⛈️',
    description: 'Dark slate with electric blue accents',
    colors: {
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#60a5fa',
      text: '#e2e8f0',
      textSecondary: '#cbd5e1',
      border: '#334155',
      messageSent: '#3b82f6',
      messageReceived: '#1e293b',
      online: '#3b82f6',
      offline: '#6b7280',
      unread: '#3b82f6',
      hover: '#1e293b',
      active: '#334155',
    },
  },
]

export const getTheme = (key: string): ChatTheme => {
  return chatThemes.find((t) => t.key === key) || chatThemes[0]
}

export const applyTheme = (theme: ChatTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--chat-bg', theme.colors.background)
  root.style.setProperty('--chat-bg-secondary', theme.colors.backgroundSecondary)
  root.style.setProperty('--chat-primary', theme.colors.primary)
  root.style.setProperty('--chat-primary-hover', theme.colors.primaryHover)
  root.style.setProperty('--chat-secondary', theme.colors.secondary)
  root.style.setProperty('--chat-text', theme.colors.text)
  root.style.setProperty('--chat-text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--chat-border', theme.colors.border)
  root.style.setProperty('--chat-message-sent', theme.colors.messageSent)
  root.style.setProperty('--chat-message-received', theme.colors.messageReceived)
  root.style.setProperty('--chat-online', theme.colors.online)
  root.style.setProperty('--chat-offline', theme.colors.offline)
  root.style.setProperty('--chat-unread', theme.colors.unread)
  root.style.setProperty('--chat-hover', theme.colors.hover)
  root.style.setProperty('--chat-active', theme.colors.active)
}

export const getStoredTheme = (): string => {
  if (typeof window === 'undefined') return 'emerald'
  return localStorage.getItem('chat-theme') || 'emerald'
}

export const setStoredTheme = (themeKey: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('chat-theme', themeKey)
}

// Custom user themes storage
export const getUserThemes = (): ChatTheme[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('user-custom-themes')
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export const saveUserTheme = (theme: ChatTheme) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getUserThemes()
    const updated = existing.filter((t) => t.key !== theme.key)
    updated.push(theme)
    localStorage.setItem('user-custom-themes', JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save custom theme:', error)
  }
}

export const deleteUserTheme = (themeKey: string) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getUserThemes()
    const updated = existing.filter((t) => t.key !== themeKey)
    localStorage.setItem('user-custom-themes', JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to delete custom theme:', error)
  }
}

export const getAllThemes = (): ChatTheme[] => {
  const userThemes = getUserThemes()
  return [...chatThemes, ...userThemes]
}

