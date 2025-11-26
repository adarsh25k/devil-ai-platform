import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify admin token
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Get key_name from query parameters
    const searchParams = request.nextUrl.searchParams;
    const keyName = searchParams.get('key_name');

    // Validate key_name is provided
    if (!keyName) {
      return NextResponse.json(
        { error: 'key_name parameter is required', code: 'MISSING_KEY_NAME' },
        { status: 400 }
      );
    }

    // Check if API key exists
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .limit(1);

    if (existingKey.length === 0) {
      return NextResponse.json(
        { error: 'API key not found', code: 'KEY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the API key
    const deleted = await db
      .delete(apiKeys)
      .where(eq(apiKeys.keyName, keyName))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete API key', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'API key deleted'
      },
      { status: 200 }
    );
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