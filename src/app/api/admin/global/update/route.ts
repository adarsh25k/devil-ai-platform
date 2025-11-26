import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_TOKEN' },
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

    // Parse request body
    const body = await request.json();
    const { key, value } = body;

    // Validate required fields
    if (!key || key.trim() === '') {
      return NextResponse.json(
        { error: 'Key is required', code: 'MISSING_KEY' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedKey = key.trim();
    const sanitizedValue = typeof value === 'string' ? value.trim() : String(value);

    // Check if key exists in global_config table
    const existingConfig = await db
      .select()
      .from(globalConfig)
      .where(eq(globalConfig.key, sanitizedKey))
      .limit(1);

    let result;

    if (existingConfig.length > 0) {
      // Update existing record
      const updated = await db
        .update(globalConfig)
        .set({
          value: sanitizedValue,
          updatedAt: new Date().toISOString()
        })
        .where(eq(globalConfig.key, sanitizedKey))
        .returning();

      result = updated[0];
    } else {
      // Insert new record
      const inserted = await db
        .insert(globalConfig)
        .values({
          key: sanitizedKey,
          value: sanitizedValue,
          updatedAt: new Date().toISOString()
        })
        .returning();

      result = inserted[0];
    }

    return NextResponse.json(
      {
        success: true,
        config: result
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/global-config error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}