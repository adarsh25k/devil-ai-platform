import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

/**
 * Universal API key loader
 * Fetches and decrypts API keys from database
 * Returns null if key not found (no errors thrown)
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  try {
    const keyEntry = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key_name, keyName))
      .limit(1);

    if (!keyEntry || keyEntry.length === 0) {
      console.warn(`[getApiKey] Key not found: ${keyName}`);
      return null;
    }

    const encryptedValue = keyEntry[0].encrypted_value;
    const decrypted = decrypt(encryptedValue);
    
    return decrypted;
  } catch (error) {
    console.error(`[getApiKey] Error loading key ${keyName}:`, error);
    return null;
  }
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