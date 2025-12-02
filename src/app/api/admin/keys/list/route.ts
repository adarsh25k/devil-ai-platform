import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
import { readApiKeys } from '@/lib/apiKeyPersistence';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }

    // Use new persistence layer - ALWAYS reads from Turso database
    const allKeys = await readApiKeys();
    
    // Return non-sensitive fields + model_id
    const keys = allKeys.map(key => ({
      id: key.id,
      key_name: key.keyName,
      model_id: key.modelId, // 🔥 NEW: Include model ID from database
      created_at: key.createdAt,
      created_by: key.createdBy
    }));

    console.log(`[Admin] Returning ${keys.length} API keys with model IDs`);

    return NextResponse.json({
      success: true,
      keys,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('GET /api/admin/keys/list error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}