import { gql } from '@apollo/client'

// Chat Queries
export const MY_CHATS_QUERY = gql`
  query MyChats($limit: Int, $offset: Int) {
    myChats(limit: $limit, offset: $offset) {
      id
      type
      lastMessage {
        id
        content
        sender {
          id
          username
          avatar
        }
        createdAt
      }
      lastMessageAt
      createdAt
      participants {
        id
        user {
          id
          username
          first_name
          last_name
          avatar
          email
        }
        unreadCount
        lastReadAt
      }
    }
  }
`

export const CHAT_QUERY = gql`
  query Chat($id: ID!) {
    chat(id: $id) {
      id
      type
      createdAt
      participants {
        id
        user {
          id
          username
          first_name
          last_name
          avatar
          email
        }
        role
        joinedAt
        muted
        archived
        unreadCount
        lastReadAt
      }
      lastMessage {
        id
        content
        createdAt
      }
    }
  }
`

export const CHAT_MESSAGES_QUERY = gql`
  query ChatMessages($chatID: ID!, $limit: Int, $before: ID) {
    chatMessages(chatID: $chatID, limit: $limit, before: $before) {
      id
      chatID
      senderID
      sender {
        id
        username
        first_name
        last_name
        avatar
      }
      content
      mediaType
      mediaURL
      mediaMetadata
      replyTo {
        id
        content
        sender {
          username
        }
      }
      messageType
      status
      createdAt
      updatedAt
      sequenceNumber
    }
  }
`

export const CHAT_PARTICIPANTS_QUERY = gql`
  query ChatParticipants($chatID: ID!) {
    chatParticipants(chatID: $chatID) {
      id
      user {
        id
        username
        first_name
        last_name
        avatar
        email
      }
      role
      joinedAt
      muted
      archived
      unreadCount
      lastReadAt
    }
  }
`

// Chat Mutations
export const CREATE_DM_CHAT_MUTATION = gql`
  mutation CreateDMChat($participantID: ID!) {
    createDMChat(participantID: $participantID) {
      id
      type
      createdAt
      participants {
        id
        user {
          id
          username
          avatar
        }
      }
    }
  }
`

export const MARK_MESSAGES_READ_MUTATION = gql`
  mutation MarkMessagesRead($chatID: ID!, $messageIDs: [ID!]!) {
    markMessagesRead(chatID: $chatID, messageIDs: $messageIDs)
  }
`

export const ARCHIVE_CHAT_MUTATION = gql`
  mutation ArchiveChat($chatID: ID!, $archived: Boolean!) {
    archiveChat(chatID: $chatID, archived: $archived)
  }
`

export const MUTE_CHAT_MUTATION = gql`
  mutation MuteChat($chatID: ID!, $muted: Boolean!) {
    muteChat(chatID: $chatID, muted: $muted)
  }
`

export const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageID: ID!) {
    deleteMessage(messageID: $messageID)
  }
`

// Chat Subscriptions
export const CHAT_TYPING_SUBSCRIPTION = gql`
  subscription ChatTyping($chatID: ID!) {
    chatTyping(chatID: $chatID) {
      chatID
      userID
      typing
      timestamp
    }
  }
`

export const USER_PRESENCE_SUBSCRIPTION = gql`
  subscription UserPresence($userID: ID!) {
    userPresence(userID: $userID) {
      userID
      online
      lastSeen
    }
  }
`

