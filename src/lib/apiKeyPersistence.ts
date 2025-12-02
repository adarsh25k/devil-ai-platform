import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto';

/**
 * API Key Persistence Layer
 * Ensures API keys are NEVER lost during hot reloads or server restarts
 * All operations read/write directly from Turso database
 * 🔥 NOW INCLUDES MODEL IDs - Database is single source of truth
 */

export interface ApiKeyEntry {
  id?: number;
  keyName: string;
  encryptedValue: string;
  modelId: string; // 🔥 NEW: Exact model ID from OpenRouter
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Read all API keys from database
 * ALWAYS reads from persistent Turso storage
 */
export async function readApiKeys(): Promise<ApiKeyEntry[]> {
  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        keyName: apiKeys.keyName,
        encryptedValue: apiKeys.encryptedValue,
        modelId: apiKeys.modelId,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
        createdBy: apiKeys.createdBy,
      })
      .from(apiKeys);
    
    console.log(`[Persistence] Loaded ${keys.length} API keys from database`);
    return keys;
  } catch (error) {
    console.error('[Persistence] Error reading API keys:', error);
    throw new Error(`Failed to read API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save or update an API key with its model ID
 * ALWAYS writes to persistent Turso storage
 */
export async function saveApiKey(
  keyName: string,
  value: string,
  modelId: string,
  createdBy: string
): Promise<{ success: boolean; message: string; keyName: string }> {
  try {
    const timestamp = new Date().toISOString();
    const encryptedValue = encrypt(value.trim());
    
    console.log(`[Persistence] Saving key ${keyName} with model ID: "${modelId}"`);
    
    // Check if key already exists
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName.trim()))
      .limit(1);
    
    if (existingKey.length > 0) {
      // Update existing key
      await db
        .update(apiKeys)
        .set({
          encryptedValue: encryptedValue,
          modelId: modelId.trim(),
          updatedAt: timestamp,
        })
        .where(eq(apiKeys.keyName, keyName.trim()));
      
      console.log(`[Persistence] Updated API key: ${keyName} → Model: ${modelId}`);
      return {
        success: true,
        message: 'API key updated successfully',
        keyName: keyName.trim(),
      };
    } else {
      // Insert new key
      await db
        .insert(apiKeys)
        .values({
          keyName: keyName.trim(),
          encryptedValue: encryptedValue,
          modelId: modelId.trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: createdBy,
        });
      
      console.log(`[Persistence] Saved new API key: ${keyName} → Model: ${modelId}`);
      return {
        success: true,
        message: 'API key saved successfully',
        keyName: keyName.trim(),
      };
    }
  } catch (error) {
    console.error(`[Persistence] Error saving API key ${keyName}:`, error);
    throw new Error(`Failed to save API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an API key
 * ALWAYS removes from persistent Turso storage
 */
export async function deleteApiKey(keyName: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await db
      .delete(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .returning();
    
    if (result.length === 0) {
      console.warn(`[Persistence] API key not found for deletion: ${keyName}`);
      return {
        success: false,
        message: 'API key not found',
      };
    }
    
    console.log(`[Persistence] Deleted API key: ${keyName}`);
    return {
      success: true,
      message: 'API key deleted successfully',
    };
  } catch (error) {
    console.error(`[Persistence] Error deleting API key ${keyName}:`, error);
    throw new Error(`Failed to delete API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific API key by name (decrypted)
 * ALWAYS reads from persistent Turso storage
 */
export async function getApiKeyByName(keyName: string): Promise<string | null> {
  try {
    const keyEntry = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);
    
    if (!keyEntry || keyEntry.length === 0) {
      console.warn(`[Persistence] API key not found: ${keyName}`);
      return null;
    }
    
    const decrypted = decrypt(keyEntry[0].encryptedValue);
    console.log(`[Persistence] Retrieved API key: ${keyName}`);
    return decrypted;
  } catch (error) {
    console.error(`[Persistence] Error retrieving API key ${keyName}:`, error);
    return null;
  }
}

/**
 * 🔥 NEW: Get model ID for a specific key
 * Returns EXACT model ID string from database - NO MODIFICATIONS
 */
export async function getModelIdByKey(keyName: string): Promise<string | null> {
  try {
    const keyEntry = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);
    
    if (!keyEntry || keyEntry.length === 0) {
      console.warn(`[Persistence] Model ID not found for key: ${keyName}`);
      return null;
    }
    
    console.log(`[Persistence] Retrieved model ID for ${keyName}: "${keyEntry[0].modelId}"`);
    return keyEntry[0].modelId;
  } catch (error) {
    console.error(`[Persistence] Error retrieving model ID for ${keyName}:`, error);
    return null;
  }
}

/**
 * 🔥 NEW: Get BOTH API key and model ID in one query
 * Returns decrypted key and raw model ID
 */
export async function getKeyAndModel(keyName: string): Promise<{ apiKey: string; modelId: string } | null> {
  try {
    const keyEntry = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);
    
    if (!keyEntry || keyEntry.length === 0) {
      console.warn(`[Persistence] Key and model not found: ${keyName}`);
      return null;
    }
    
    const decryptedKey = decrypt(keyEntry[0].encryptedValue);
    const modelId = keyEntry[0].modelId;
    
    console.log(`[Persistence] Retrieved ${keyName} → Model: "${modelId}"`);
    
    return {
      apiKey: decryptedKey,
      modelId: modelId
    };
  } catch (error) {
    console.error(`[Persistence] Error retrieving key and model for ${keyName}:`, error);
    return null;
  }
}

/**
 * Verify database connection and schema
 * Used for health checks
 */
export async function verifyPersistenceLayer(): Promise<{ healthy: boolean; message: string; keyCount: number }> {
  try {
    const keys = await readApiKeys();
    return {
      healthy: true,
      message: 'Persistence layer is healthy',
      keyCount: keys.length,
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Persistence layer error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      keyCount: 0,
    };
  }
}