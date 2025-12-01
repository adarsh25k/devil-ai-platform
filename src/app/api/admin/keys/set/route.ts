import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

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
    const { key_name, value, keyName, keyValue } = body;
    
    // Support both field name formats
    const finalKeyName = key_name || keyName;
    const finalValue = value || keyValue;
    
    if (!finalKeyName || typeof finalKeyName !== 'string' || finalKeyName.trim() === '') {
      return NextResponse.json(
        { error: 'keyName is required and must be a non-empty string', code: 'MISSING_KEY_NAME' },
        { status: 400 }
      );
    }
    
    if (!finalValue || typeof finalValue !== 'string' || finalValue.trim() === '') {
      return NextResponse.json(
        { error: 'keyValue is required and must be a non-empty string', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }
    
    // Use the universal encrypt function from @/lib/crypto (AES-256-GCM)
    const encryptedValue = encrypt(finalValue.trim());
    const timestamp = new Date().toISOString();
    const username = tokenData.username;
    
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, finalKeyName.trim()))
      .limit(1);
    
    if (existingKey.length > 0) {
      await db
        .update(apiKeys)
        .set({
          encryptedValue: encryptedValue,
          updatedAt: timestamp,
        })
        .where(eq(apiKeys.keyName, finalKeyName.trim()));
      
      return NextResponse.json({
        success: true,
        message: 'API key updated',
        keyName: finalKeyName.trim(),
      });
    } else {
      await db
        .insert(apiKeys)
        .values({
          keyName: finalKeyName.trim(),
          encryptedValue: encryptedValue,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: username,
        });
      
      return NextResponse.json({
        success: true,
        message: 'API key saved',
        keyName: finalKeyName.trim(),
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