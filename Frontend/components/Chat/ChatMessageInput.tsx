'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { PaperClipIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import EmojiPicker from './EmojiPicker'

interface ChatMessageInputProps {
  onSendMessage: (content: string, mediaURL?: string, replyTo?: string) => void
}

export default function ChatMessageInput({ onSendMessage }: ChatMessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, we'll just send the file name
    // In production, you'd upload to Cloudinary first
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onSendMessage('', reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      onSendMessage(`📎 ${file.name}`)
    }
  }

  return (
    <div
      className="min-h-12 md:h-12 px-3 md:px-4 py-2 flex items-center gap-1.5 md:gap-2 border-t flex-shrink-0"
      style={{ borderColor: 'var(--chat-border)', backgroundColor: 'var(--chat-bg-secondary)' }}
    >
      <label className="cursor-pointer flex-shrink-0">
        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
          onChange={handleFileSelect}
        />
        <PaperClipIcon className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--chat-text-secondary)' }} />
      </label>

      <div className="flex-1 relative min-w-0">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
          }}
          onKeyPress={handleKeyPress}
          placeholder="Write the message"
          rows={1}
          className="w-full px-3 md:px-4 py-2 rounded-full resize-none overflow-hidden text-xs md:text-sm border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--chat-bg)',
            borderColor: 'var(--chat-border)',
            color: 'var(--chat-text)',
            maxHeight: '120px',
          }}
        />
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 md:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ color: 'var(--chat-text-secondary)' }}
        >
          <FaceSmileIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker onSelectEmoji={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="p-1.5 md:p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        style={{
          backgroundColor: message.trim() ? 'var(--chat-primary)' : 'var(--chat-border)',
          color: 'white',
        }}
      >
        <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  )
}

