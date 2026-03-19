'use client'

import { format } from 'date-fns'
import ChatAvatar from './ChatAvatar'

interface ChatMessageProps {
  message: any
  isOwn: boolean
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return ''
    }
  }

  return (
    <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="flex-shrink-0 mt-auto">
          <ChatAvatar user={message.sender} size="sm" />
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
        <div
          className={`rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 shadow-sm ${
            isOwn 
              ? 'rounded-br-sm text-white' 
              : 'rounded-bl-sm text-gray-800 dark:text-gray-100'
          }`}
          style={{
            backgroundColor: isOwn 
              ? 'var(--chat-message-sent)' 
              : 'var(--chat-message-received)',
          }}
        >
          {message.replyTo && (
            <div
              className="mb-2 pl-3 border-l-2 text-xs opacity-75"
              style={{ borderColor: isOwn ? 'rgba(255,255,255,0.5)' : 'var(--chat-border)' }}
            >
              <div className="font-semibold">
                {message.replyTo.sender?.username || 'Unknown'}
              </div>
              <div className="truncate">{message.replyTo.content}</div>
            </div>
          )}

          {message.mediaURL ? (
            <div className="mb-2">
              {message.mediaType === 'image' ? (
                <img
                  src={message.mediaURL}
                  alt="Message media"
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <a
                  href={message.mediaURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-white bg-opacity-20"
                >
                  <span>📎 {message.mediaURL.split('/').pop()}</span>
                </a>
              )}
            </div>
          ) : null}

          {message.content && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        <span className={`text-[10px] md:text-xs mt-1 md:mt-1.5 px-1 md:px-2 ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>

      {isOwn && (
        <div className="flex-shrink-0 mt-auto">
          <ChatAvatar user={message.sender} size="sm" />
        </div>
      )}
    </div>
  )
}

