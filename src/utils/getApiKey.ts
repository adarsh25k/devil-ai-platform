import { getApiKeyByName } from '@/lib/apiKeyPersistence';

/**
 * Universal API key loader
 * Fetches and decrypts API keys from persistent Turso database
 * Returns null if key not found (no errors thrown)
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  return getApiKeyByName(keyName);
}

// Helper functions for direct key access (auto-decrypt)

export async function getMainBrainKey(): Promise<string | null> {
  return getApiKey('main_brain_key');
}

export async function getCodingKey(): Promise<string | null> {
  return getApiKey('coding_key');
}

export async function getDebuggingApiKey(): Promise<string | null> {
  return getApiKey('debugging_api_key');
}

export async function getFastApiKey(): Promise<string | null> {
  return getApiKey('fast_api_key');
}

export async function getUiUxMockupApiKey(): Promise<string | null> {
  return getApiKey('uiux_mockup_api_key');
}

export async function getImageGenerationApiKey(): Promise<string | null> {
  return getApiKey('image_generation_api_key');
}

export async function getGameDevKey(): Promise<string | null> {
  return getApiKey('game_dev_key');
}

export async function getCanvasNotesApiKey(): Promise<string | null> {
  return getApiKey('canvas_notes_api_key');
}

export async function getImageKey(): Promise<string | null> {
  return getApiKey('image_key');
}