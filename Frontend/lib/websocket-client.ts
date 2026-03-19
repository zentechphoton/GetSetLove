import { WSMessage, SendMessagePayload, TypingPayload, SubscribePayload, MarkReadPayload } from '@/types/websocket'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        return
      }

      this.isConnecting = true

      const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
      if (!token) {
        reject(new Error('No authentication token'))
        this.isConnecting = false
        return
      }

      // WebSocket endpoint - adjust based on your backend route
      const wsUrl = `${WS_URL}/ws/chat?token=${encodeURIComponent(token)}`
      
      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket closed')
          this.isConnecting = false
          this.attemptReconnect()
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      this.connect().catch(console.error)
    }, delay)
  }

  private handleMessage(message: WSMessage) {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message.payload)
        } catch (error) {
          console.error('Error in message listener:', error)
        }
      })
    }
  }

  sendMessage(type: string, payload: any, requestID?: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }

    const message: WSMessage = {
      type,
      payload,
      request_id: requestID || this.generateRequestID(),
    }

    this.ws.send(JSON.stringify(message))
  }

  // Message operations
  sendChatMessage(chatID: string, content: string, tempID: string, mediaURL?: string, replyTo?: string) {
    const payload: SendMessagePayload = {
      chat_id: chatID,
      content,
      temp_id: tempID,
      media_url: mediaURL,
      reply_to: replyTo,
    }
    this.sendMessage('message.send', payload)
  }

  startTyping(chatID: string) {
    const payload: TypingPayload = {
      chat_id: chatID,
      typing: true,
    }
    this.sendMessage('typing.start', payload)
  }

  stopTyping(chatID: string) {
    const payload: TypingPayload = {
      chat_id: chatID,
      typing: false,
    }
    this.sendMessage('typing.stop', payload)
  }

  subscribeToChat(chatID: string) {
    const payload: SubscribePayload = {
      chat_id: chatID,
    }
    this.sendMessage('subscribe', payload)
  }

  unsubscribeFromChat(chatID: string) {
    const payload: SubscribePayload = {
      chat_id: chatID,
    }
    this.sendMessage('unsubscribe', payload)
  }

  markMessagesRead(chatID: string, messageIDs: string[]) {
    const payload: MarkReadPayload = {
      chat_id: chatID,
      message_ids: messageIDs,
    }
    this.sendMessage('message.read', payload)
  }

  // Event listeners
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private generateRequestID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
let wsClientInstance: WebSocketClient | null = null

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient()
  }
  return wsClientInstance
}

