import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
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
    const { key_type } = body;
    
    if (!key_type || typeof key_type !== 'string' || key_type.trim() === '') {
      return NextResponse.json(
        { error: 'key_type is required', code: 'MISSING_KEY_TYPE' },
        { status: 400 }
      );
    }
    
    // Retrieve the key from database
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, key_type.trim()))
      .limit(1);
    
    if (keyRecord.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          status: 'NOT_FOUND',
          message: `No API key found for type: ${key_type}`,
          key_type 
        },
        { status: 404 }
      );
    }
    
    // Decrypt the key
    let decryptedKey;
    try {
      decryptedKey = decrypt(keyRecord[0].encryptedValue);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          status: 'DECRYPTION_ERROR',
          message: 'Failed to decrypt API key',
          key_type 
        },
        { status: 500 }
      );
    }
    
    // Test the key by making a simple API call to OpenRouter
    try {
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${decryptedKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (testResponse.ok) {
        const models = await testResponse.json();
        return NextResponse.json({
          success: true,
          status: 'WORKING',
          message: `✅ API key is valid and working! Found ${models.data?.length || 0} available models.`,
          key_type,
          models_count: models.data?.length || 0,
          tested_at: new Date().toISOString()
        });
      } else {
        const errorData = await testResponse.json().catch(() => ({ error: 'Unknown error' }));
        return NextResponse.json({
          success: false,
          status: 'INVALID',
          message: `❌ API key test failed: ${errorData.error?.message || testResponse.statusText}`,
          key_type,
          error_details: errorData,
          tested_at: new Date().toISOString()
        }, { status: 200 }); // Return 200 but with success: false
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        status: 'NETWORK_ERROR',
        message: `❌ Network error while testing API key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key_type,
        tested_at: new Date().toISOString()
      }, { status: 200 }); // Return 200 but with success: false
    }
    
  } catch (error) {
    console.error('Test key error:', error);
    return NextResponse.json(
      { 
        success: false,
        status: 'INTERNAL_ERROR',
        message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
