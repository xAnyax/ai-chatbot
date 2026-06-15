import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeContext'
import { useDisplaySettings } from './DisplaySettingsContext'
import { useModelSettings } from './ModelSettingsContext'
import { AIProvider, AI_PROVIDERS } from './models'
import { AuthUser } from './types'
import { ChatMessage, Chat } from './types'
import { FormattedMessage } from './FormattedMessage'
import { AuthModal } from './AuthModal'
import './App.css'

interface AppProps {
  user: AuthUser | null
  isAuthenticated: boolean
  onLogout: () => void
  onNewChat: () => void
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (id: string) => void
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
  onDeleteChat: (id: string) => void
}

export const App: React.FC<AppProps> = ({
  user,
  isAuthenticated,
  onLogout,
  onNewChat,
  chats,
  currentChatId,
  onSelectChat,
  messages,
  onSendMessage,
  onDeleteChat
}) => {
  const { isDark, toggleTheme } = useTheme()
  const { providerLabel, modelLabel } = useModelSettings()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isChatEditMode, setIsChatEditMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (chats.length === 0) {
      setIsChatEditMode(false)
    }
  }, [chats.length])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setIsLoading(true)
    try {
      await onSendMessage(inputValue)
      setInputValue('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsClose = () => {
    setShowSettingsModal(false)
  }

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={onNewChat}>
            + New Chat
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="chat-history">
          <div className="chat-history-header">
            <h3>Chat History</h3>
            {chats.length > 0 && (
              <button
                type="button"
                className={`edit-chats-btn ${isChatEditMode ? 'active' : ''}`}
                onClick={() => setIsChatEditMode((prev) => !prev)}
              >
                {isChatEditMode ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
          {chats.length === 0 ? (
            <p className="empty-history">
              {isAuthenticated ? 'No chats yet' : 'No chats yet. Guest chats clear on reload.'}
            </p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li key={chat.id} className={currentChatId === chat.id ? 'active' : ''}>
                  <button
                    className="chat-item"
                    onClick={() => onSelectChat(chat.id)}
                    title={chat.title}
                  >
                    {chat.title.substring(0, 20)}...
                  </button>
                  {isChatEditMode && (
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteChat(chat.id)}
                      title="Delete chat"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sidebar-footer">
          {isAuthenticated && user && (
            <p className="sidebar-user-label">Signed in as {user.username}</p>
          )}
          <div className="sidebar-footer-actions">
            <button
              type="button"
              className="auth-btn"
              onClick={isAuthenticated ? onLogout : () => setShowAuthModal(true)}
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
            <button className="settings-btn" onClick={() => setShowSettingsModal(true)}>
              ⚙️ Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-container">
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}

        {showSettingsModal && (
          <SettingsModal onClose={handleSettingsClose} />
        )}

        {!currentChatId && !showSettingsModal && !showAuthModal && (
          <div className="welcome-message">
            <h1>Welcome to AI Chatbot</h1>
            <p>
              {isAuthenticated
                ? 'Select a chat or create a new one to get started.'
                : 'Start chatting as a guest, or login to save your history.'}
            </p>
            <button className="start-btn" onClick={onNewChat}>
              Start New Chat
            </button>
          </div>
        )}

        {currentChatId && (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <span className="chat-header-label">AI Model</span>
                <span className="chat-header-model">
                  {providerLabel} · {modelLabel}
                </span>
              </div>
              <button
                type="button"
                className="chat-header-settings-btn"
                onClick={() => setShowSettingsModal(true)}
              >
                Change model
              </button>
            </div>

            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <p>Start the conversation by typing a message below.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-content">
                      <FormattedMessage content={msg.content} role={msg.role} />
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                autoFocus
              />
              <button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        )}
      </main>

      {/* Settings Modal */}
    </div>
  )
}

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    provider,
    modelId,
    setProvider,
    setModelId,
  } = useModelSettings()
  const {
    fontSize,
    lineHeight,
    messagePadding,
    setFontSize,
    setLineHeight,
    setMessagePadding,
    resetDisplaySettings,
  } = useDisplaySettings()

  const selectedProvider = AI_PROVIDERS.find((item) => item.id === provider) ?? AI_PROVIDERS[0]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <section className="settings-section">
          <h3>AI Model</h3>
          <p className="settings-help">
            Choose a provider and model. All options use Puter.js — no separate API keys needed.
          </p>

          <label className="settings-field">
            <span>Provider</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            >
              {AI_PROVIDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span>Model</span>
            <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {selectedProvider.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </label>

          <p className="settings-provider-note">{selectedProvider.description}</p>
        </section>

        <section className="settings-section">
          <div className="settings-section-header">
            <h3>Display</h3>
            <button type="button" className="settings-reset-btn" onClick={resetDisplaySettings}>
              Reset
            </button>
          </div>

          <label className="settings-control">
            <span>Font size</span>
            <span className="settings-value">{fontSize}px</span>
            <input
              type="range"
              min={12}
              max={22}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </label>

          <label className="settings-control">
            <span>Line spacing</span>
            <span className="settings-value">{lineHeight.toFixed(2)}</span>
            <input
              type="range"
              min={1.2}
              max={2.2}
              step={0.05}
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
            />
          </label>

          <label className="settings-control">
            <span>Message padding</span>
            <span className="settings-value">{messagePadding}px</span>
            <input
              type="range"
              min={8}
              max={28}
              step={1}
              value={messagePadding}
              onChange={(e) => setMessagePadding(Number(e.target.value))}
            />
          </label>

          <div className="settings-preview">
            <p className="settings-preview-label">Preview</p>
            <div className="message assistant">
              <div className="message-content">
                <FormattedMessage
                  content="This is how your **AI responses** will look with the current settings."
                  role="assistant"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
