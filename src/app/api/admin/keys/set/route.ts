import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
import { saveApiKey } from '@/lib/apiKeyPersistence';

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
    
    // Use new persistence layer - ALWAYS writes to Turso database
    const result = await saveApiKey(
      finalKeyName.trim(),
      finalValue.trim(),
      tokenData.username
    );
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}