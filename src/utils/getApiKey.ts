import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

/**
 * Universal helper to fetch and decrypt API keys from database
 * Returns null if key not found (not an error)
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  try {
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);

    if (keyRecord.length === 0) {
      console.warn(`API key not found in database: ${keyName}`);
      return null;
    }

    // Decrypt the key value using AES-256-GCM
    const decryptedKey = decrypt(keyRecord[0].encryptedValue);
    return decryptedKey;
  } catch (error) {
    console.error(`Failed to retrieve/decrypt API key ${keyName}:`, error);
    return null;
  }
}

/**
 * Check if an API key exists in the database
 */
export async function hasApiKey(keyName: string): Promise<boolean> {
  try {
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);

    return keyRecord.length > 0;
  } catch (error) {
    console.error(`Failed to check API key existence ${keyName}:`, error);
    return false;
  }
}

/**
 * Helper function to get Debugging API Key
 * Automatically decrypts the stored key
 */
export async function getDebuggingApiKey(): Promise<string | null> {
  return await getApiKey('debugging_api_key');
}

/**
 * Helper function to get Fast Daily Use API Key
 * Automatically decrypts the stored key
 */
export async function getFastApiKey(): Promise<string | null> {
  return await getApiKey('fast_api_key');
}

/**
 * Helper function to get Canvas / PPT / Notes API Key
 * Automatically decrypts the stored key
 */
export async function getCanvasNotesApiKey(): Promise<string | null> {
  return await getApiKey('canvas_notes_api_key');
}