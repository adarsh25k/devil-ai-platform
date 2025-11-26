import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatLogs } from '@/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const chatId = searchParams.get('chat_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate limit and offset
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    // Build WHERE conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(chatLogs.userId, userId));
    }

    if (chatId) {
      conditions.push(eq(chatLogs.chatId, chatId));
    }

    if (dateFrom) {
      conditions.push(gte(chatLogs.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(chatLogs.createdAt, dateTo));
    }

    // Build and execute query for logs
    let logsQuery = db.select().from(chatLogs);

    if (conditions.length > 0) {
      logsQuery = logsQuery.where(and(...conditions));
    }

    const logs = await logsQuery
      .orderBy(desc(chatLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count with same filters
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(chatLogs);

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const countResult = await countQuery;
    const totalCount = countResult[0]?.count ?? 0;

    return NextResponse.json({
      success: true,
      logs: logs,
      count: totalCount
    }, { status: 200 });

  } catch (error) {
    console.error('GET chat logs error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}