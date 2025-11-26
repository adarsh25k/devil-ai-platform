import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userThemes, themes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query user_themes table for the userId
    const userThemeResult = await db
      .select()
      .from(userThemes)
      .where(eq(userThemes.userId, userId))
      .limit(1);

    // If no user theme preference found, return null values
    if (userThemeResult.length === 0) {
      return NextResponse.json({
        success: true,
        userTheme: null,
        theme: null
      });
    }

    const userTheme = userThemeResult[0];

    // Fetch the full theme details using themeId
    const themeResult = await db
      .select()
      .from(themes)
      .where(eq(themes.id, userTheme.themeId))
      .limit(1);

    // If theme not found (shouldn't happen with proper foreign key), return partial data
    if (themeResult.length === 0) {
      return NextResponse.json({
        success: true,
        userTheme,
        theme: null
      });
    }

    const theme = themeResult[0];

    return NextResponse.json({
      success: true,
      userTheme,
      theme
    });

  } catch (error) {
    console.error('GET user theme error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}