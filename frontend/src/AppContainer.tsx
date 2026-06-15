import React, { useState, useEffect } from 'react'
import { App } from './App'
import { ThemeProvider } from './ThemeContext'
import { DisplaySettingsProvider } from './DisplaySettingsContext'
import { ModelSettingsProvider, useModelSettings } from './ModelSettingsContext'
import { AuthProvider, useAuth } from './AuthContext'
import { Chat, ChatMessage } from './types'
import { api } from './api'
import { createGuestChat } from './guestChat'
import { clearChatCache } from './sessionCache'
import './index.css'

const AppContainer: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DisplaySettingsProvider>
          <ModelSettingsProvider>
            <AppContainerInner />
          </ModelSettingsProvider>
        </DisplaySettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

const AppContainerInner: React.FC = () => {
  const { modelId } = useModelSettings()
  const { user, isAuthenticated, isInitializing, logout } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    clearChatCache()
    setChats([])
    setMessages([])
    setCurrentChatId(null)
  }, [])

  useEffect(() => {
    if (isInitializing) return

    if (isAuthenticated) {
      loadChats()
      return
    }

    setChats([])
    setMessages([])
    setCurrentChatId(null)
  }, [isAuthenticated, isInitializing])

  useEffect(() => {
    if (!currentChatId || !isAuthenticated) return
    loadMessages(currentChatId)
  }, [currentChatId, isAuthenticated])

  const loadChats = async () => {
    try {
      const loadedChats = await api.getChats()
      setChats(loadedChats)
      setCurrentChatId((prev) => {
        if (prev && loadedChats.some((chat: Chat) => chat.id === prev)) {
          return prev
        }
        return loadedChats.length > 0 ? loadedChats[0].id : null
      })
    } catch (error) {
      console.error('Failed to load chats:', error)
      setChats([])
      setCurrentChatId(null)
    }
  }

  const normalizeContent = (content: unknown): string => {
    if (typeof content === 'string') return content
    if (content && typeof content === 'object') {
      const data = content as Record<string, unknown>
      const message = data.message as Record<string, unknown> | undefined
      if (typeof message?.content === 'string') return message.content
      if (message?.content && typeof message.content === 'object' && 'toString' in message.content) {
        return (message.content as { toString: () => string }).toString()
      }
    }
    return String(content ?? '')
  }

  const loadMessages = async (chatId: string) => {
    try {
      const data = await api.getChatMessages(chatId)
      setMessages(
        (data.messages || []).map((msg: ChatMessage) => ({
          ...msg,
          content: normalizeContent(msg.content),
        }))
      )
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const handleNewChat = async () => {
    if (isAuthenticated) {
      try {
        const newChat = await api.createChat()
        setChats([newChat, ...chats])
        setCurrentChatId(newChat.id)
        setMessages([])
      } catch (error) {
        console.error('Failed to create chat:', error)
      }
      return
    }

    const newChat = createGuestChat()
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
    setMessages([])
  }

  const handleSendMessage = async (message: string) => {
    if (!currentChatId) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)

    try {
      const response = await api.sendMessage(
        currentChatId,
        message,
        messages,
        modelId,
        isAuthenticated,
      )
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      }
      const updatedMessages = [...nextMessages, assistantMessage]
      setMessages(updatedMessages)

      if (isAuthenticated) {
        if (messages.length === 0) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, title: message.substring(0, 30) + '...' }
                : chat
            )
          )
        }
        return
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== currentChatId) return chat

          const title =
            chat.messages.length === 0
              ? message.substring(0, 30) + (message.length > 30 ? '...' : '')
              : chat.title

          return {
            ...chat,
            title,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          }
        })
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => prev.slice(0, -1))
    }
  }

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
    if (!isAuthenticated) {
      const chat = chats.find((item) => item.id === id)
      setMessages(chat?.messages || [])
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (isAuthenticated) {
      try {
        await api.deleteChat(id)
        const remainingChats = chats.filter((chat) => chat.id !== id)
        setChats(remainingChats)
        if (currentChatId === id) {
          setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null)
          setMessages([])
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
      }
      return
    }

    const remainingChats = chats.filter((chat) => chat.id !== id)
    setChats(remainingChats)
    if (currentChatId === id) {
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null)
      setMessages([])
    }
  }

  const handleLogout = () => {
    logout()
    setChats([])
    setMessages([])
    setCurrentChatId(null)
    clearChatCache()
  }

  if (isInitializing) {
    return <div className="auth-loading">Loading...</div>
  }

  return (
    <App
      user={user}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      onNewChat={handleNewChat}
      chats={chats}
      currentChatId={currentChatId}
      onSelectChat={handleSelectChat}
      messages={messages}
      onSendMessage={handleSendMessage}
      onDeleteChat={handleDeleteChat}
    />
  )
}

export default AppContainer
