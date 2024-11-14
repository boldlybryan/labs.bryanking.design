export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultModel: 'gpt-3.5-turbo',
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
} 