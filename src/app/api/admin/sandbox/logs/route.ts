import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { codeExecutionLogs } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
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

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const language = searchParams.get('language');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build conditions array for filtering
    const conditions = [];
    if (userId) {
      conditions.push(eq(codeExecutionLogs.userId, userId));
    }
    if (language) {
      conditions.push(eq(codeExecutionLogs.language, language));
    }

    // Build base query
    let logsQuery = db.select().from(codeExecutionLogs);
    let countQuery = db.select({ count: count() }).from(codeExecutionLogs);

    // Apply filters if conditions exist
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      logsQuery = logsQuery.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Execute queries
    const logs = await logsQuery
      .orderBy(desc(codeExecutionLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count ?? 0;

    return NextResponse.json({
      success: true,
      logs,
      count: totalCount
    }, { status: 200 });

  } catch (error) {
    console.error('GET code execution logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}