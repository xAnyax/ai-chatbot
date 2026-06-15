import React, { createContext, useContext, useEffect, useState } from 'react'

export interface DisplaySettings {
  fontSize: number
  lineHeight: number
  messagePadding: number
}

const DEFAULT_SETTINGS: DisplaySettings = {
  fontSize: 15,
  lineHeight: 1.65,
  messagePadding: 16,
}

const STORAGE_KEY = 'display-settings'

interface DisplaySettingsContextType extends DisplaySettings {
  setFontSize: (value: number) => void
  setLineHeight: (value: number) => void
  setMessagePadding: (value: number) => void
  resetDisplaySettings: () => void
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(
  undefined
)

function loadSettings(): DisplaySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS

    const parsed = JSON.parse(saved) as Partial<DisplaySettings>
    return {
      fontSize: clamp(parsed.fontSize ?? DEFAULT_SETTINGS.fontSize, 12, 22),
      lineHeight: clamp(parsed.lineHeight ?? DEFAULT_SETTINGS.lineHeight, 1.2, 2.2),
      messagePadding: clamp(parsed.messagePadding ?? DEFAULT_SETTINGS.messagePadding, 8, 28),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export const DisplaySettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<DisplaySettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

    const root = document.documentElement
    root.style.setProperty('--message-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--message-line-height', String(settings.lineHeight))
    root.style.setProperty('--message-padding-y', `${settings.messagePadding}px`)
    root.style.setProperty(
      '--message-padding-x',
      `${Math.round(settings.messagePadding * 1.25)}px`
    )
  }, [settings])

  const update = (patch: Partial<DisplaySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  return (
    <DisplaySettingsContext.Provider
      value={{
        ...settings,
        setFontSize: (fontSize) => update({ fontSize }),
        setLineHeight: (lineHeight) => update({ lineHeight }),
        setMessagePadding: (messagePadding) => update({ messagePadding }),
        resetDisplaySettings: () => setSettings(DEFAULT_SETTINGS),
      }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  )
}

export const useDisplaySettings = () => {
  const context = useContext(DisplaySettingsContext)
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within DisplaySettingsProvider')
  }
  return context
}
