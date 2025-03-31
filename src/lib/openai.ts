
// Client-side OpenAI integration for storing user API keys in local storage

const STORAGE_KEY = 'openai_api_key';

export const getOpenAIKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const setOpenAIKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey);
};

export const clearOpenAIKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
