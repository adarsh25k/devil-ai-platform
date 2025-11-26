import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if theme exists
    const existingTheme = await db
      .select()
      .from(themes)
      .where(eq(themes.id, parseInt(id)))
      .limit(1);

    if (existingTheme.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found', code: 'THEME_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Prepare update object (only include fields that are provided)
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
    if (body.backgroundColor !== undefined) updateData.backgroundColor = body.backgroundColor;
    if (body.glowIntensity !== undefined) updateData.glowIntensity = body.glowIntensity;
    if (body.animationSpeed !== undefined) updateData.animationSpeed = body.animationSpeed;
    if (body.chatBubbleStyle !== undefined) updateData.chatBubbleStyle = body.chatBubbleStyle;
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily;
    if (body.devilAccents !== undefined) updateData.devilAccents = body.devilAccents;
    if (body.smokeDensity !== undefined) updateData.smokeDensity = body.smokeDensity;
    if (body.gradientMode !== undefined) updateData.gradientMode = body.gradientMode;
    if (body.iconSet !== undefined) updateData.iconSet = body.iconSet;
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

    // Update the theme
    const updatedTheme = await db
      .update(themes)
      .set(updateData)
      .where(eq(themes.id, parseInt(id)))
      .returning();

    if (updatedTheme.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update theme', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        theme: updatedTheme[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if theme exists
    const existingTheme = await db
      .select()
      .from(themes)
      .where(eq(themes.id, parseInt(id)))
      .limit(1);

    if (existingTheme.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found', code: 'THEME_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the theme
    const deletedTheme = await db
      .delete(themes)
      .where(eq(themes.id, parseInt(id)))
      .returning();

    if (deletedTheme.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete theme', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Theme deleted',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}