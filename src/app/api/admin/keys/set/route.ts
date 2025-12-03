import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32bytes!!';
const ALGORITHM = 'aes-256-gcm';

function encryptValue(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8').slice(0, 32), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value } = body;

    if (!value || typeof value !== 'string' || !value.startsWith('sk-or-')) {
      return NextResponse.json(
        { error: 'Invalid OpenRouter API key format. Must start with sk-or-' },
        { status: 400 }
      );
    }

    const encryptedValue = encryptValue(value);
    const now = new Date().toISOString();

    // Check if key already exists
    const existing = await db.select().from(apiKeys).where(eq(apiKeys.keyName, 'openrouter'));

    if (existing.length > 0) {
      // Update existing key
      await db
        .update(apiKeys)
        .set({
          encryptedValue,
          updatedAt: now,
        })
        .where(eq(apiKeys.keyName, 'openrouter'));

      console.log('[API Key] Updated OpenRouter key');
    } else {
      // Insert new key
      await db.insert(apiKeys).values({
        keyName: 'openrouter',
        encryptedValue,
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin',
      });

      console.log('[API Key] Created OpenRouter key');
    }

    return NextResponse.json({ 
      success: true,
      message: 'OpenRouter API key saved successfully' 
    });
  } catch (error) {
    console.error('[API Key] Error saving key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}