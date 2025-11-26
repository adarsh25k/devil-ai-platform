import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatLogs } from '@/db/schema';
import { verifyToken } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization token required',
          code: 'MISSING_TOKEN'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
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
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Calculate total tokens in
    const totalInResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${chatLogs.tokensIn}), 0)` 
      })
      .from(chatLogs);
    
    const totalIn = totalInResult[0]?.total || 0;

    // Calculate total tokens out
    const totalOutResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${chatLogs.tokensOut}), 0)` 
      })
      .from(chatLogs);
    
    const totalOut = totalOutResult[0]?.total || 0;

    // Calculate total tokens
    const total = totalIn + totalOut;

    // Calculate average tokens per message
    const avgResult = await db
      .select({ 
        avg: sql<number>`COALESCE(AVG(${chatLogs.tokensIn} + ${chatLogs.tokensOut}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(chatLogs);
    
    const avgPerMessage = Math.round(avgResult[0]?.avg || 0);
    const messageCount = avgResult[0]?.count || 0;

    // Calculate token usage by model
    const byModelResult = await db
      .select({
        model: chatLogs.modelUsed,
        tokensIn: sql<number>`COALESCE(SUM(${chatLogs.tokensIn}), 0)`,
        tokensOut: sql<number>`COALESCE(SUM(${chatLogs.tokensOut}), 0)`,
        total: sql<number>`COALESCE(SUM(${chatLogs.tokensIn} + ${chatLogs.tokensOut}), 0)`,
        messageCount: sql<number>`COUNT(*)`
      })
      .from(chatLogs)
      .groupBy(chatLogs.modelUsed)
      .orderBy(sql`SUM(${chatLogs.tokensIn} + ${chatLogs.tokensOut}) DESC`);

    const byModel = byModelResult.map(row => ({
      model: row.model || 'unknown',
      tokensIn: row.tokensIn,
      tokensOut: row.tokensOut,
      total: row.total,
      messageCount: row.messageCount
    }));

    return NextResponse.json({
      success: true,
      tokenUsage: {
        totalIn,
        totalOut,
        total,
        avgPerMessage,
        messageCount,
        byModel
      }
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