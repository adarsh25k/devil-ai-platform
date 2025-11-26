import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modelRoutingRules } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify Bearer token
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
    
    // Verify the token
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

    // Query all model routing rules ordered by priority DESC
    const rules = await db
      .select()
      .from(modelRoutingRules)
      .orderBy(desc(modelRoutingRules.priority));

    return NextResponse.json({
      success: true,
      rules
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}