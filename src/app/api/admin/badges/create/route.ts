import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges } from '@/db/schema';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
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

    // Parse request body
    const body = await request.json();
    const { badge_name, badge_description, badge_icon, requirement_type, requirement_value } = body;

    // Validate all required fields
    if (!badge_name) {
      return NextResponse.json(
        { error: 'badge_name is required', code: 'MISSING_BADGE_NAME' },
        { status: 400 }
      );
    }

    if (!badge_description) {
      return NextResponse.json(
        { error: 'badge_description is required', code: 'MISSING_BADGE_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!badge_icon) {
      return NextResponse.json(
        { error: 'badge_icon is required', code: 'MISSING_BADGE_ICON' },
        { status: 400 }
      );
    }

    if (!requirement_type) {
      return NextResponse.json(
        { error: 'requirement_type is required', code: 'MISSING_REQUIREMENT_TYPE' },
        { status: 400 }
      );
    }

    if (requirement_value === undefined || requirement_value === null) {
      return NextResponse.json(
        { error: 'requirement_value is required', code: 'MISSING_REQUIREMENT_VALUE' },
        { status: 400 }
      );
    }

    // Validate requirement_value is a number
    if (typeof requirement_value !== 'number' || isNaN(requirement_value)) {
      return NextResponse.json(
        { error: 'requirement_value must be a valid number', code: 'INVALID_REQUIREMENT_VALUE' },
        { status: 400 }
      );
    }

    // Insert new badge into database
    const newBadge = await db.insert(badges)
      .values({
        badgeName: badge_name.trim(),
        badgeDescription: badge_description.trim(),
        badgeIcon: badge_icon.trim(),
        requirementType: requirement_type.trim(),
        requirementValue: requirement_value,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        badge: newBadge[0]
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST badge error:', error);
    
    // Handle unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A badge with this name already exists', code: 'DUPLICATE_BADGE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}