import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themes, userThemes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, theme_id } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!theme_id) {
      return NextResponse.json({ 
        error: "theme_id is required",
        code: "MISSING_THEME_ID" 
      }, { status: 400 });
    }

    // Validate theme_id is a valid number
    const themeIdNum = parseInt(theme_id as string);
    if (isNaN(themeIdNum)) {
      return NextResponse.json({ 
        error: "theme_id must be a valid number",
        code: "INVALID_THEME_ID" 
      }, { status: 400 });
    }

    // Check if theme exists
    const themeExists = await db.select()
      .from(themes)
      .where(eq(themes.id, themeIdNum))
      .limit(1);

    if (themeExists.length === 0) {
      return NextResponse.json({ 
        error: "Theme not found",
        code: "THEME_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if user already has a theme preference
    const existingPreference = await db.select()
      .from(userThemes)
      .where(eq(userThemes.userId, user_id as string))
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingPreference.length > 0) {
      // Update existing preference
      const updated = await db.update(userThemes)
        .set({
          themeId: themeIdNum,
          updatedAt: currentTimestamp
        })
        .where(eq(userThemes.userId, user_id as string))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Theme preference saved",
        theme_id: themeIdNum
      }, { status: 200 });
    } else {
      // Insert new preference
      const inserted = await db.insert(userThemes)
        .values({
          userId: user_id as string,
          themeId: themeIdNum,
          updatedAt: currentTimestamp
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "Theme preference saved",
        theme_id: themeIdNum
      }, { status: 201 });
    }

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}