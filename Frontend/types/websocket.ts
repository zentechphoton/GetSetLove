export interface WSMessage {
  type: string
  request_id?: string
  payload: any
}

export interface SendMessagePayload {
  chat_id: string
  content?: string
  media_url?: string
  temp_id: string
  reply_to?: string
}

export interface TypingPayload {
  chat_id: string
  user_id?: string
  typing: boolean
}

export interface SubscribePayload {
  chat_id: string
}

export interface MarkReadPayload {
  chat_id: string
  message_ids: string[]
}

export interface MessageAckPayload {
  temp_id: string
  message: any
}

export interface ErrorPayload {
  code: string
  message: string
}

