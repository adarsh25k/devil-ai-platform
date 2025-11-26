import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges } from '@/db/schema';
import { verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify Bearer token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization header with Bearer token is required',
          code: 'MISSING_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token using verifyToken from @/lib/db
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

    // Query all badges from the database
    const allBadges = await db.select().from(badges);

    // Return success response with badges
    return NextResponse.json({
      success: true,
      badges: allBadges
    }, { status: 200 });

  } catch (error) {
    console.error('GET badges error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}