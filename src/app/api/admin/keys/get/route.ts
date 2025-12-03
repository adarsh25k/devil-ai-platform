import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32bytes!!';
const ALGORITHM = 'aes-256-gcm';

function decryptValue(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8').slice(0, 32), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function GET(request: NextRequest) {
  try {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.keyName, 'openrouter'));

    if (result.length === 0) {
      return NextResponse.json({ 
        exists: false,
        key: null 
      });
    }

    const decryptedKey = decryptValue(result[0].encryptedValue);

    return NextResponse.json({
      exists: true,
      key: decryptedKey,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  } catch (error) {
    console.error('[API Key] Error retrieving key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    );
  }
}
