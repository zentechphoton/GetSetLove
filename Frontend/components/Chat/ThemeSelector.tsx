'use client'

import { useRef, useEffect, useState } from 'react'
import { ChatTheme, getAllThemes, saveUserTheme, deleteUserTheme, getUserThemes, chatThemes } from '@/lib/chat-themes'
import { PlusIcon, TrashIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface ThemeSelectorProps {
  themes: ChatTheme[]
  currentTheme: string
  onSelectTheme: (themeKey: string) => void
  onClose: () => void
  onCreateCustomTheme?: () => void
}

export default function ThemeSelector({ themes, currentTheme, onSelectTheme, onClose, onCreateCustomTheme }: ThemeSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null)
  const customThemes = getUserThemes()

  // Always use all 12 default themes from chatThemes, regardless of what's passed in props
  // This ensures all 12 themes are always shown
  const defaultThemes = chatThemes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleDeleteCustom = (e: React.MouseEvent, themeKey: string) => {
    e.stopPropagation()
    if (confirm('Delete this custom theme?')) {
      deleteUserTheme(themeKey)
      if (currentTheme === themeKey) {
        onSelectTheme('emerald') // Fallback to default
      }
      // Reload to refresh custom themes list
      setTimeout(() => window.location.reload(), 100)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={selectorRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[550px] rounded-2xl shadow-2xl border overflow-hidden z-[9999]"
        style={{
          backgroundColor: 'var(--chat-bg)',
          borderColor: 'var(--chat-border)',
        }}
      >
        <div className="p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: 'var(--chat-text)' }}>
              Choose Theme
            </h3>
            <div className="flex items-center gap-2">
              {onCreateCustomTheme && (
                <button
                  onClick={onCreateCustomTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 shadow-md"
                  style={{
                    backgroundColor: 'var(--chat-primary)',
                    color: '#ffffff',
                  }}
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Create Custom
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'var(--chat-text-secondary)' }}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* All 12 Themes Grid - 2 columns, 6 rows - No Scroll */}
          <div className="grid grid-cols-2 gap-2.5">
            {defaultThemes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => onSelectTheme(theme.key)}
                className={`p-2.5 rounded-lg border-2 transition-all text-left relative group hover:scale-[1.02] ${currentTheme === theme.key ? 'ring-2 ring-offset-1 shadow-md' : ''
                  }`}
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: currentTheme === theme.key ? theme.colors.primary : theme.colors.border,
                }}
              >
                {/* Color Swatch Triangle - Top Left - Smaller */}
                <div
                  className="absolute top-0 left-0 w-10 h-10 rounded-tl-lg"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  }}
                />

                {/* Selection Checkmark - Top Right - Smaller */}
                {currentTheme === theme.key && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: theme.colors.primary }}>
                    <CheckCircleIconSolid className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Content - Compact */}
                <div className="relative z-10 mt-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                      {theme.name}
                    </span>
                  </div>
                  <p className="text-xs leading-tight line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                    {theme.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Themes Section - Compact */}
          {customThemes.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--chat-border)' }}>
              <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--chat-text-secondary)' }}>
                Your Custom Themes
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {customThemes.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => onSelectTheme(theme.key)}
                    className={`p-2.5 rounded-lg border-2 transition-all text-left relative group hover:scale-[1.02] ${currentTheme === theme.key ? 'ring-2 ring-offset-1 shadow-md' : ''
                      }`}
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: currentTheme === theme.key ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    {/* Color Swatch Triangle - Smaller */}
                    <div
                      className="absolute top-0 left-0 w-10 h-10 rounded-tl-lg"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                      }}
                    />

                    {/* Selection Checkmark - Smaller */}
                    {currentTheme === theme.key && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: theme.colors.primary }}>
                        <CheckCircleIconSolid className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Delete Button - Smaller */}
                    <button
                      onClick={(e) => handleDeleteCustom(e, theme.key)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 z-20"
                      style={{
                        color: 'var(--chat-text-secondary)',
                        backgroundColor: currentTheme === theme.key ? 'transparent' : 'var(--chat-bg)'
                      }}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>

                    {/* Content - Compact */}
                    <div className="relative z-10 mt-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">{theme.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                          {theme.name}
                        </span>
                      </div>
                      <p className="text-xs leading-tight line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                        {theme.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

