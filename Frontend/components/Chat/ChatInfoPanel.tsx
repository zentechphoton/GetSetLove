'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ChatAvatar from './ChatAvatar'

interface ChatInfoPanelProps {
  chat: any
  onClose: () => void
  currentUserId?: string
}

export default function ChatInfoPanel({ chat, onClose, currentUserId }: ChatInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'files'>('info')

  const getOtherParticipant = () => {
    if (!currentUserId) {
      return chat.participants?.[0]?.user
    }
    return chat.participants?.find((p: any) => p.user?.id !== currentUserId)?.user || chat.participants?.[0]?.user
  }

  const participant = getOtherParticipant()

  // Mock data for media and files
  const mediaItems = [
    { id: '1', url: 'https://via.placeholder.com/150', type: 'image' },
    { id: '2', url: 'https://via.placeholder.com/150', type: 'image' },
    { id: '3', url: 'https://via.placeholder.com/150', type: 'image' },
  ]

  const fileItems = [
    { id: '1', name: 'document.pdf', size: '2.4 MB', date: '2024-01-15' },
    { id: '2', name: 'presentation.pptx', size: '5.1 MB', date: '2024-01-14' },
  ]

  return (
    <div
      className="w-80 flex flex-col border-l h-full"
      style={{
        backgroundColor: 'var(--chat-bg-secondary)',
        borderColor: 'var(--chat-border)',
      }}
    >
      {/* Header */}
      <div className="h-18 px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--chat-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--chat-text)' }}>
          Chat Info
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ color: 'var(--chat-text-secondary)' }}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Contact Info */}
      <div className="px-4 py-6 flex flex-col items-center border-b" style={{ borderColor: 'var(--chat-border)' }}>
        <ChatAvatar user={participant} size="xl" online={true} />
        <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--chat-text)' }}>
          {participant?.first_name || participant?.username || 'Unknown'}
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--chat-text-secondary)' }}>
          Online
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--chat-border)' }}>
        {[
          { id: 'info' as const, label: 'Info' },
          { id: 'media' as const, label: 'Media' },
          { id: 'files' as const, label: 'Files' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === tab.id ? 'var(--chat-primary)' : 'var(--chat-text-secondary)',
              borderBottomColor: activeTab === tab.id ? 'var(--chat-primary)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--chat-text-secondary)' }}>
                About
              </h4>
              <p className="text-sm" style={{ color: 'var(--chat-text)' }}>
                {participant?.first_name || 'No description available'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--chat-text-secondary)' }}>
                Email
              </h4>
              <p className="text-sm" style={{ color: 'var(--chat-text)' }}>
                {participant?.email || 'Not available'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--chat-text-secondary)' }}>
                Phone
              </h4>
              <p className="text-sm" style={{ color: 'var(--chat-text)' }}>
                Not available
              </p>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-2">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--chat-border)' }}
              >
                <img src={item.url} alt="Media" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            {fileItems.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-lg border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--chat-bg)',
                  borderColor: 'var(--chat-border)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--chat-text)' }}>
                    {file.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--chat-text-secondary)' }}>
                    {file.size} • {file.date}
                  </p>
                </div>
                <button
                  className="ml-2 px-3 py-1 text-xs rounded"
                  style={{
                    backgroundColor: 'var(--chat-primary)',
                    color: 'white',
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

