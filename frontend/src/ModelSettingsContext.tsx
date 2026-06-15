import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  AIProvider,
  getDefaultModelForProvider,
  getModelLabel,
  getProviderConfig,
  getProviderForModel,
} from './models'

interface ModelSettings {
  provider: AIProvider
  modelId: string
}

interface ModelSettingsContextType extends ModelSettings {
  setProvider: (provider: AIProvider) => void
  setModelId: (modelId: string) => void
  providerLabel: string
  modelLabel: string
}

const STORAGE_KEY = 'ai-model-settings'
const DEFAULT_SETTINGS: ModelSettings = {
  provider: 'openai',
  modelId: getDefaultModelForProvider('openai'),
}

const ModelSettingsContext = createContext<ModelSettingsContextType | undefined>(
  undefined
)

function loadSettings(): ModelSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS

    const parsed = JSON.parse(saved) as Partial<ModelSettings>
    const provider = parsed.provider ?? DEFAULT_SETTINGS.provider
    const config = getProviderConfig(provider)
    const modelId =
      parsed.modelId && config.models.some((m) => m.id === parsed.modelId)
        ? parsed.modelId
        : getDefaultModelForProvider(provider)

    return { provider, modelId }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const ModelSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<ModelSettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setProvider = (provider: AIProvider) => {
    setSettings({
      provider,
      modelId: getDefaultModelForProvider(provider),
    })
  }

  const setModelId = (modelId: string) => {
    setSettings({
      provider: getProviderForModel(modelId),
      modelId,
    })
  }

  const providerLabel = getProviderConfig(settings.provider).label

  return (
    <ModelSettingsContext.Provider
      value={{
        ...settings,
        setProvider,
        setModelId,
        providerLabel,
        modelLabel: getModelLabel(settings.modelId),
      }}
    >
      {children}
    </ModelSettingsContext.Provider>
  )
}

export const useModelSettings = () => {
  const context = useContext(ModelSettingsContext)
  if (context === undefined) {
    throw new Error('useModelSettings must be used within ModelSettingsProvider')
  }
  return context
}
