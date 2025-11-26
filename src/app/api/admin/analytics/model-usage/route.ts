import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatLogs } from '@/db/schema';
import { verifyToken } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Aggregate messages by model (COUNT)
    const messagesByModel = await db
      .select({
        model: chatLogs.modelUsed,
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(chatLogs)
      .where(sql`${chatLogs.modelUsed} IS NOT NULL`)
      .groupBy(chatLogs.modelUsed)
      .orderBy(sql`COUNT(*) DESC`);

    // Aggregate average latency by model
    const avgLatencyByModel = await db
      .select({
        model: chatLogs.modelUsed,
        avgLatency: sql<number>`CAST(AVG(${chatLogs.latency}) AS REAL)`,
      })
      .from(chatLogs)
      .where(sql`${chatLogs.modelUsed} IS NOT NULL AND ${chatLogs.latency} IS NOT NULL`)
      .groupBy(chatLogs.modelUsed)
      .orderBy(sql`AVG(${chatLogs.latency}) ASC`);

    // Determine most used model
    let mostUsed = '';
    if (messagesByModel.length > 0) {
      mostUsed = messagesByModel[0].model || '';
    }

    // Format the response
    const modelUsage = {
      byModel: messagesByModel.map(item => ({
        model: item.model,
        count: item.count,
      })),
      avgLatencyByModel: avgLatencyByModel.map(item => ({
        model: item.model,
        avgLatency: item.avgLatency,
      })),
      mostUsed,
    };

    return NextResponse.json({
      success: true,
      modelUsage,
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}