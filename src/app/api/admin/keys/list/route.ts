import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { verifyToken } from '@/lib/db';

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

    const keys = await db.select({
      id: apiKeys.id,
      key_name: apiKeys.keyName,
      created_at: apiKeys.createdAt,
      created_by: apiKeys.createdBy
    })
    .from(apiKeys);

    return NextResponse.json({
      success: true,
      keys
    });

  } catch (error) {
    console.error('GET /api/api-keys error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}