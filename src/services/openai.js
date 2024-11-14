import { OPENAI_CONFIG } from './config'

export const createChatCompletion = async ({
  messages,
  model = OPENAI_CONFIG.defaultModel,
  temperature = 0.7,
  max_tokens = 1000,
}) => {
  try {
    const response = await fetch(`${OPENAI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        ...OPENAI_CONFIG.defaultHeaders,
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get completion')
    }

    const data = await response.json()
    return data.choices[0].message
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
} 