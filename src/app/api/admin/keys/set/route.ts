import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
  const salt = process.env.ENCRYPTION_SALT || 'default-salt-change-in-production';
  return scryptSync(secret, salt, ENCRYPTION_KEY_LENGTH);
}

function encryptValue(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_AUTH_TOKEN' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    let tokenData;
    try {
      tokenData = await verifyToken(token);
      
      if (!tokenData || !tokenData.username) {
        return NextResponse.json(
          { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { key_name, value } = body;
    
    if (!key_name || typeof key_name !== 'string' || key_name.trim() === '') {
      return NextResponse.json(
        { error: 'key_name is required and must be a non-empty string', code: 'MISSING_KEY_NAME' },
        { status: 400 }
      );
    }
    
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return NextResponse.json(
        { error: 'value is required and must be a non-empty string', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }
    
    const encryptedValue = encryptValue(value);
    const timestamp = new Date().toISOString();
    const username = tokenData.username;
    
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, key_name.trim()))
      .limit(1);
    
    if (existingKey.length > 0) {
      const updated = await db
        .update(apiKeys)
        .set({
          encryptedValue: encryptedValue,
          updatedAt: timestamp,
        })
        .where(eq(apiKeys.keyName, key_name.trim()))
        .returning();
      
      return NextResponse.json({
        success: true,
        message: 'API key updated',
        key_name: key_name.trim(),
      });
    } else {
      const created = await db
        .insert(apiKeys)
        .values({
          keyName: key_name.trim(),
          encryptedValue: encryptedValue,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: username,
        })
        .returning();
      
      return NextResponse.json({
        success: true,
        message: 'API key saved',
        key_name: key_name.trim(),
      }, { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}