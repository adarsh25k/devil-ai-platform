import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { uiTexts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
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
    const { key, value, category } = body;

    // Validate required fields
    if (!key) {
      return NextResponse.json(
        { error: 'Key is required', code: 'MISSING_KEY' },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json(
        { error: 'Value is required', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedKey = key.trim();
    const sanitizedValue = value.trim();
    const sanitizedCategory = category.trim();

    // Check if key exists
    const existingRecord = await db
      .select()
      .from(uiTexts)
      .where(eq(uiTexts.key, sanitizedKey))
      .limit(1);

    let result;

    if (existingRecord.length > 0) {
      // Update existing record
      const updated = await db
        .update(uiTexts)
        .set({
          value: sanitizedValue,
          category: sanitizedCategory,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(uiTexts.key, sanitizedKey))
        .returning();

      result = updated[0];
    } else {
      // Insert new record
      const inserted = await db
        .insert(uiTexts)
        .values({
          key: sanitizedKey,
          value: sanitizedValue,
          category: sanitizedCategory,
          updatedAt: new Date().toISOString(),
        })
        .returning();

      result = inserted[0];
    }

    return NextResponse.json(
      {
        success: true,
        text: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}