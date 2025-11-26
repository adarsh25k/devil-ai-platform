import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themes } from '@/db/schema';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required', code: 'UNAUTHORIZED' },
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

    // Extract and validate required fields
    const {
      name,
      primaryColor,
      accentColor,
      backgroundColor,
      chatBubbleStyle,
      fontFamily,
      gradientMode,
      iconSet,
      glowIntensity,
      animationSpeed,
      devilAccents,
      smokeDensity,
      isEnabled,
      isDefault
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!primaryColor) {
      return NextResponse.json(
        { error: 'Primary color is required', code: 'MISSING_PRIMARY_COLOR' },
        { status: 400 }
      );
    }

    if (!accentColor) {
      return NextResponse.json(
        { error: 'Accent color is required', code: 'MISSING_ACCENT_COLOR' },
        { status: 400 }
      );
    }

    if (!backgroundColor) {
      return NextResponse.json(
        { error: 'Background color is required', code: 'MISSING_BACKGROUND_COLOR' },
        { status: 400 }
      );
    }

    if (!chatBubbleStyle) {
      return NextResponse.json(
        { error: 'Chat bubble style is required', code: 'MISSING_CHAT_BUBBLE_STYLE' },
        { status: 400 }
      );
    }

    if (!fontFamily) {
      return NextResponse.json(
        { error: 'Font family is required', code: 'MISSING_FONT_FAMILY' },
        { status: 400 }
      );
    }

    if (!gradientMode) {
      return NextResponse.json(
        { error: 'Gradient mode is required', code: 'MISSING_GRADIENT_MODE' },
        { status: 400 }
      );
    }

    if (!iconSet) {
      return NextResponse.json(
        { error: 'Icon set is required', code: 'MISSING_ICON_SET' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedPrimaryColor = primaryColor.trim();
    const sanitizedAccentColor = accentColor.trim();
    const sanitizedBackgroundColor = backgroundColor.trim();
    const sanitizedChatBubbleStyle = chatBubbleStyle.trim();
    const sanitizedFontFamily = fontFamily.trim();
    const sanitizedGradientMode = gradientMode.trim();
    const sanitizedIconSet = iconSet.trim();

    // Prepare insert data with defaults for optional fields
    const insertData = {
      name: sanitizedName,
      primaryColor: sanitizedPrimaryColor,
      accentColor: sanitizedAccentColor,
      backgroundColor: sanitizedBackgroundColor,
      chatBubbleStyle: sanitizedChatBubbleStyle,
      fontFamily: sanitizedFontFamily,
      gradientMode: sanitizedGradientMode,
      iconSet: sanitizedIconSet,
      glowIntensity: glowIntensity !== undefined ? glowIntensity : 5,
      animationSpeed: animationSpeed !== undefined ? animationSpeed.trim() : 'normal',
      devilAccents: devilAccents !== undefined ? devilAccents : true,
      smokeDensity: smokeDensity !== undefined ? smokeDensity : 5,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      isDefault: isDefault !== undefined ? isDefault : false,
      createdAt: new Date().toISOString()
    };

    // Insert into database
    const newTheme = await db.insert(themes)
      .values(insertData)
      .returning();

    return NextResponse.json(
      {
        success: true,
        theme: newTheme[0]
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST theme error:', error);
    
    // Handle unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Theme with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}