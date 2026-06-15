export type AIProvider = 'openai' | 'claude' | 'gemini' | 'deepseek' | 'grok'

export interface AIModel {
  id: string
  label: string
}

export interface AIProviderConfig {
  id: AIProvider
  label: string
  description: string
  models: AIModel[]
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT models via Puter.js',
    models: [
      { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano' },
      { id: 'gpt-5-nano', label: 'GPT-5 Nano' },
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    description: 'Anthropic Claude models',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
      { id: 'claude-fable-5', label: 'Claude Fable 5' },
    ],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Google Gemini models',
    models: [
      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    description: 'DeepSeek reasoning models',
    models: [
      { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
      { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
      { id: 'deepseek/deepseek-v3.2', label: 'DeepSeek V3.2' },
      { id: 'deepseek/deepseek-r1-0528', label: 'DeepSeek R1' },
    ],
  },
  {
    id: 'grok',
    label: 'Grok',
    description: 'xAI Grok models',
    models: [
      { id: 'x-ai/grok-4.3', label: 'Grok 4.3' },
      { id: 'x-ai/grok-4-1-fast', label: 'Grok 4.1 Fast' },
      { id: 'x-ai/grok-build-0.1', label: 'Grok Build 0.1' },
      { id: 'x-ai/grok-4-fast', label: 'Grok 4 Fast' },
    ],
  },
]

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS.find((p) => p.id === provider) ?? AI_PROVIDERS[0]
}

export function getDefaultModelForProvider(provider: AIProvider): string {
  return getProviderConfig(provider).models[0].id
}

export function getModelLabel(modelId: string): string {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId)
    if (model) return model.label
  }
  return modelId
}

export function getProviderForModel(modelId: string): AIProvider {
  for (const provider of AI_PROVIDERS) {
    if (provider.models.some((m) => m.id === modelId)) {
      return provider.id
    }
  }
  return 'openai'
}
