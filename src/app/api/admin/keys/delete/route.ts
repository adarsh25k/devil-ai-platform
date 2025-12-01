import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
import { deleteApiKey } from '@/lib/apiKeyPersistence';

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_AUTH_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyName = searchParams.get('key_name');

    if (!keyName) {
      return NextResponse.json(
        { error: 'key_name parameter is required', code: 'MISSING_KEY_NAME' },
        { status: 400 }
      );
    }

    // Use new persistence layer - ALWAYS deletes from Turso database
    const result = await deleteApiKey(keyName);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message, code: 'KEY_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      keyName: keyName
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}